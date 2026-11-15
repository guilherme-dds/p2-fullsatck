import { useEffect, useState } from 'react'
import { cadastrarProduto, excluirProduto, listarProdutos } from './api.js'

const CATEGORIAS = ['Eletrônicos', 'Roupas', 'Casa', 'Livros', 'Outros']
const FORM_VAZIO = { nome: '', descricao: '', categoria: CATEGORIAS[0], preco: '', estoque: 0 }

const formatarPreco = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function App() {
  const [aba, setAba] = useState('loja')
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [mensagem, setMensagem] = useState(null) // { tipo: 'ok' | 'erro', texto }

  async function carregar() {
    setCarregando(true)
    try {
      setProdutos(await listarProdutos())
    } catch (e) {
      setMensagem({ tipo: 'erro', texto: e.message })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  return (
    <>
      <header className="topo">
        <h1>Loja Virtual</h1>
        <nav>
          <button className={aba === 'loja' ? 'ativa' : ''} onClick={() => setAba('loja')}>
            Vitrine
          </button>
          <button className={aba === 'admin' ? 'ativa' : ''} onClick={() => setAba('admin')}>
            Gerenciar produtos
          </button>
        </nav>
      </header>

      <main>
        {mensagem && (
          <div className={`aviso ${mensagem.tipo}`}>
            {mensagem.texto}
            <button className="fechar" onClick={() => setMensagem(null)} aria-label="Fechar">
              ×
            </button>
          </div>
        )}

        {carregando ? (
          <p>Carregando...</p>
        ) : aba === 'loja' ? (
          <Vitrine produtos={produtos} />
        ) : (
          <Gerenciar produtos={produtos} recarregar={carregar} setMensagem={setMensagem} />
        )}
      </main>
    </>
  )
}

/* ---------- LISTAR (GET) — vitrine da loja ---------- */
function Vitrine({ produtos }) {
  if (produtos.length === 0) return <p>Nenhum produto disponível no momento.</p>

  return (
    <div className="grade">
      {produtos.map((p) => (
        <article key={p.id} className="produto">
          <span className="categoria">{p.categoria}</span>
          <h3>{p.nome}</h3>
          <p className="descricao">{p.descricao || 'Sem descrição.'}</p>
          <p className="preco">{formatarPreco(p.preco)}</p>
          <p className={p.estoque > 0 ? 'estoque' : 'estoque esgotado'}>
            {p.estoque > 0 ? `${p.estoque} em estoque` : 'Esgotado'}
          </p>
        </article>
      ))}
    </div>
  )
}

/* ---------- CADASTRAR (POST) e EXCLUIR (DELETE) ---------- */
function Gerenciar({ produtos, recarregar, setMensagem }) {
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setErros({})
    try {
      const novo = await cadastrarProduto(form)
      setMensagem({ tipo: 'ok', texto: `Produto "${novo.nome}" cadastrado com sucesso!` })
      setForm(FORM_VAZIO)
      await recarregar()
    } catch (err) {
      setErros(err.campos || {})
      setMensagem({ tipo: 'erro', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(produto) {
    if (!confirm(`Excluir "${produto.nome}"?`)) return
    try {
      const resp = await excluirProduto(produto.id)
      setMensagem({ tipo: 'ok', texto: resp.mensagem })
      await recarregar()
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  const erroDo = (campo) => erros[campo] && <small className="erro-campo">{erros[campo][0]}</small>

  return (
    <>
      <section className="caixa">
        <h2>Cadastrar produto</h2>
        <form onSubmit={enviar}>
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" value={form.nome} onChange={alterar} required />
          {erroDo('nome')}

          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" rows="2" value={form.descricao} onChange={alterar} />
          {erroDo('descricao')}

          <div className="linha">
            <div>
              <label htmlFor="categoria">Categoria</label>
              <select id="categoria" name="categoria" value={form.categoria} onChange={alterar}>
                {CATEGORIAS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {erroDo('categoria')}
            </div>
            <div>
              <label htmlFor="preco">Preço (R$)</label>
              <input id="preco" name="preco" type="number" step="0.01" min="0" value={form.preco} onChange={alterar} required />
              {erroDo('preco')}
            </div>
            <div>
              <label htmlFor="estoque">Estoque</label>
              <input id="estoque" name="estoque" type="number" min="0" value={form.estoque} onChange={alterar} required />
              {erroDo('estoque')}
            </div>
          </div>

          <button type="submit" className="primario" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Cadastrar'}
          </button>
        </form>
      </section>

      <section className="caixa">
        <h2>Produtos cadastrados ({produtos.length})</h2>
        {produtos.length === 0 ? (
          <p>Nenhum produto cadastrado.</p>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.nome}</td>
                    <td>{p.categoria}</td>
                    <td>{formatarPreco(p.preco)}</td>
                    <td>{p.estoque}</td>
                    <td>
                      <button className="perigo" onClick={() => excluir(p)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}
