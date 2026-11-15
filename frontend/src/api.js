// Comunicação com o backend Laravel (via proxy do Vite em /backend).
const BASE = '/backend'

let tokenCsrf = null

// Busca o token CSRF no Laravel (rota GET /csrf-token).
// É o mesmo valor que o @csrf do Blade coloca no campo oculto "_token".
async function obterToken(forcar = false) {
  if (!tokenCsrf || forcar) {
    const resp = await fetch(`${BASE}/csrf-token`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })
    if (!resp.ok) throw new Error('Não foi possível conectar ao servidor.')
    tokenCsrf = (await resp.json()).token
  }
  return tokenCsrf
}

async function requisicao(metodo, caminho, corpo, tentouDeNovo = false) {
  const headers = { Accept: 'application/json' }
  let body

  if (metodo !== 'GET') {
    const token = await obterToken()
    headers['X-CSRF-TOKEN'] = token
    if (corpo) {
      headers['Content-Type'] = 'application/json'
      body = JSON.stringify({ _token: token, ...corpo })
    }
  }

  let resp
  try {
    resp = await fetch(`${BASE}${caminho}`, { method: metodo, headers, body, credentials: 'include' })
  } catch {
    throw new Error('Servidor indisponível. Verifique se a VM está ligada.')
  }

  // 419 = token CSRF expirado: pega um novo e tenta mais uma vez
  if (resp.status === 419 && !tentouDeNovo) {
    await obterToken(true)
    return requisicao(metodo, caminho, corpo, true)
  }

  const dados = await resp.json().catch(() => null)

  if (!resp.ok) {
    const erro = new Error(dados?.message || `Erro ${resp.status} no servidor.`)
    erro.campos = dados?.errors || {}
    throw erro
  }
  return dados
}

export const listarProdutos = () => requisicao('GET', '/produtos')
export const cadastrarProduto = (produto) => requisicao('POST', '/produtos', produto)
export const excluirProduto = (id) => requisicao('DELETE', `/produtos/${id}`)
