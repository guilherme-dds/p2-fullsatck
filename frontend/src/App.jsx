import { useEffect, useMemo, useState } from 'react'
import { cadastrarProduto, excluirProduto, listarProdutos } from './api.js'

const NOMES_CATEGORIAS = ['Eletrônicos', 'Roupas', 'Casa', 'Livros', 'Outros']
const FORM_VAZIO = { nome: '', descricao: '', categoria: NOMES_CATEGORIAS[0], preco: '', estoque: 0 }

const formatarPreco = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function App() {
  const [aba, setAba] = useState('loja')
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [aviso, setAviso] = useState(null) // { tipo: 'ok' | 'erro', texto }

  async function carregar() {
    try {
      setProdutos(await listarProdutos())
    } catch (e) {
      setAviso({ tipo: 'erro', texto: e.message })
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  // some o aviso sozinho depois de alguns segundos
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(t)
  }, [aviso])

  return (
    <>
      <header className="topo">
        <div className="topo-conteudo">
          <div className="marca">Loja Virtual</div>
          <nav className="abas">
            <button className={aba === 'loja' ? 'ativa' : ''} onClick={() => setAba('loja')}>
              Vitrine
            </button>
            <button className={aba === 'admin' ? 'ativa' : ''} onClick={() => setAba('admin')}>
              Gerenciar
            </button>
          </nav>
        </div>
      </header>

      <main>
        {carregando ? (
          <div className="vazio">Carregando produtos...</div>
        ) : aba === 'loja' ? (
          <Vitrine produtos={produtos} />
        ) : (
          <Gerenciar produtos={produtos} recarregar={carregar} setAviso={setAviso} />
        )}
      </main>

      <footer className="rodape">Trabalho Final P2 · Desenvolvimento Full Stack · Laravel + React</footer>

      {aviso && (
        <div className={`toast ${aviso.tipo}`} role="status">
          {aviso.texto}
        </div>
      )}
    </>
  )
}

/* ---------- LISTAR (GET) — vitrine da loja ---------- */
function Vitrine({ produtos }) {
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState('Todos')

  const visiveis = useMemo(
    () =>
      produtos.filter(
        (p) =>
          (filtro === 'Todos' || p.categoria === filtro) &&
          p.nome.toLowerCase().includes(busca.trim().toLowerCase())
      ),
    [produtos, busca, filtro]
  )

  return (
    <>
      <section className="destaque">
        <h1>Encontre o que você precisa</h1>
        <p>{produtos.length} produtos disponíveis na loja</p>
        <input
          className="busca"
          type="search"
          placeholder="Buscar produto..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </section>

      <div className="filtros">
        {['Todos', ...NOMES_CATEGORIAS].map((c) => (
          <button key={c} className={filtro === c ? 'chip ativo' : 'chip'} onClick={() => setFiltro(c)}>
            {c}
          </button>
        ))}
      </div>

      {visiveis.length === 0 ? (
        <div className="vazio">Nenhum produto encontrado.</div>
      ) : (
        <div className="grade">
          {visiveis.map((p) => (
            <article key={p.id} className="produto">
              <span className="categoria">{p.categoria}</span>
              <h3>{p.nome}</h3>
              <p className="descricao">{p.descricao || 'Sem descrição.'}</p>
              <div className="produto-rodape">
                <span className="preco">{formatarPreco(p.preco)}</span>
                <span className={p.estoque > 0 ? 'estoque' : 'estoque esgotado'}>
                  {p.estoque > 0 ? `${p.estoque} un.` : 'Esgotado'}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

/* ---------- CADASTRAR (POST) e EXCLUIR (DELETE) ---------- */
function Gerenciar({ produtos, recarregar, setAviso }) {
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
      setAviso({ tipo: 'ok', texto: `Produto "${novo.nome}" cadastrado!` })
      setForm(FORM_VAZIO)
      await recarregar()
    } catch (err) {
      setErros(err.campos || {})
      setAviso({ tipo: 'erro', texto: err.message })
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(produto) {
    if (!confirm(`Excluir "${produto.nome}"?`)) return
    try {
      const resp = await excluirProduto(produto.id)
      setAviso({ tipo: 'ok', texto: resp.mensagem })
      await recarregar()
    } catch (err) {
      setAviso({ tipo: 'erro', texto: err.message })
    }
  }

  const erroDo = (campo) => erros[campo] && <small className="erro-campo">{erros[campo][0]}</small>
  const classe = (campo) => (erros[campo] ? 'invalido' : '')

  return (
    <div className="painel">
      <section className="caixa">
        <h2>Novo produto</h2>
        <p className="subtitulo">Preencha os dados para cadastrar na loja.</p>

        <form onSubmit={enviar}>
          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" className={classe('nome')} value={form.nome} onChange={alterar}
                 placeholder="Ex.: Fone de ouvido" required />
          {erroDo('nome')}

          <label htmlFor="descricao">Descrição</label>
          <textarea id="descricao" name="descricao" rows="3" className={classe('descricao')}
                    value={form.descricao} onChange={alterar} placeholder="Opcional" />
          {erroDo('descricao')}

          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" name="categoria" value={form.categoria} onChange={alterar}>
            {NOMES_CATEGORIAS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          {erroDo('categoria')}

          <div className="linha">
            <div>
              <label htmlFor="preco">Preço (R$)</label>
              <input id="preco" name="preco" type="number" step="0.01" min="0" className={classe('preco')}
                     value={form.preco} onChange={alterar} placeholder="0,00" required />
              {erroDo('preco')}
            </div>
            <div>
              <label htmlFor="estoque">Estoque</label>
              <input id="estoque" name="estoque" type="number" min="0" className={classe('estoque')}
                     value={form.estoque} onChange={alterar} required />
              {erroDo('estoque')}
            </div>
          </div>

          <button type="submit" className="botao primario" disabled={enviando}>
            {enviando ? 'Salvando...' : 'Cadastrar produto'}
          </button>
        </form>
      </section>

      <section className="caixa">
        <div className="caixa-titulo">
          <h2>Produtos cadastrados</h2>
          <span className="contador">{produtos.length}</span>
        </div>

        {produtos.length === 0 ? (
          <div className="vazio">Nenhum produto cadastrado ainda.</div>
        ) : (
          <div className="tabela-rolagem">
            <table>
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((p) => (
                  <tr key={p.id}>
                    <td className="celula-produto">
                      <strong>{p.nome}</strong>
                      <small>#{p.id} · {p.categoria}</small>
                    </td>
                    <td className="nowrap">{formatarPreco(p.preco)}</td>
                    <td>{p.estoque}</td>
                    <td className="direita">
                      <button className="botao perigo" onClick={() => excluir(p)}>
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
    </div>
  )
}
