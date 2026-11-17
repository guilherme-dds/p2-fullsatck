import { useEffect, useMemo, useState } from 'react'
import { cadastrarProduto, excluirProduto, listarProdutos } from './api.js'

const CATEGORIAS = ['Eletrônicos', 'Roupas', 'Casa', 'Livros', 'Outros']
const FORM_VAZIO = { nome: '', descricao: '', categoria: CATEGORIAS[0], preco: '', estoque: 0 }

const formatarPreco = (valor) =>
  Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function App() {
  const [aba, setAba] = useState('produtos')
  const [produtos, setProdutos] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erroConexao, setErroConexao] = useState(null)

  async function carregar() {
    try {
      setProdutos(await listarProdutos())
      setErroConexao(null)
    } catch (e) {
      setErroConexao(e.message)
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
        <span className="marca">Loja Virtual</span>
        <nav>
          <a href="#produtos" aria-current={aba === 'produtos' ? 'page' : undefined}
             onClick={(e) => { e.preventDefault(); setAba('produtos') }}>
            Produtos
          </a>
          <a href="#gerenciar" aria-current={aba === 'gerenciar' ? 'page' : undefined}
             onClick={(e) => { e.preventDefault(); setAba('gerenciar') }}>
            Gerenciar
          </a>
        </nav>
      </header>

      <main>
        {erroConexao && <p className="mensagem erro" role="alert">{erroConexao}</p>}

        {carregando ? (
          <p className="vazio">Carregando produtos…</p>
        ) : aba === 'produtos' ? (
          <Catalogo produtos={produtos} />
        ) : (
          <Gerenciar produtos={produtos} recarregar={carregar} />
        )}
      </main>
    </>
  )
}

function Catalogo({ produtos }) {
  const [busca, setBusca] = useState('')
  const [categoria, setCategoria] = useState('')

  const grupos = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    const filtrados = produtos.filter(
      (p) => (!categoria || p.categoria === categoria) && p.nome.toLowerCase().includes(termo)
    )
    return CATEGORIAS.map((c) => ({ categoria: c, itens: filtrados.filter((p) => p.categoria === c) }))
      .filter((g) => g.itens.length > 0)
  }, [produtos, busca, categoria])

  return (
    <section>
      <h1>Produtos</h1>
      <p className="resumo">
        {produtos.length === 1 ? '1 produto à venda.' : `${produtos.length} produtos à venda.`}
      </p>

      <div className="filtros">
        <label>
          Buscar
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome do produto" />
        </label>
        <label>
          Categoria
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
      </div>

      {produtos.length === 0 ? (
        <p className="vazio">Nenhum produto cadastrado. Cadastre o primeiro em Gerenciar.</p>
      ) : grupos.length === 0 ? (
        <p className="vazio">Nenhum produto encontrado com esses filtros.</p>
      ) : (
        grupos.map((g) => (
          <div key={g.categoria} className="grupo">
            <h2>{g.categoria}</h2>
            <ul className="lista">
              {g.itens.map((p) => (
                <li key={p.id}>
                  <div className="item-texto">
                    <span className="item-nome">{p.nome}</span>
                    {p.descricao && <span className="item-desc">{p.descricao}</span>}
                  </div>
                  <div className="item-preco">
                    <span className="preco">{formatarPreco(p.preco)}</span>
                    <span className={p.estoque > 0 ? 'estoque' : 'estoque esgotado'}>
                      {p.estoque > 0 ? `${p.estoque} em estoque` : 'Esgotado'}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </section>
  )
}

function Gerenciar({ produtos, recarregar }) {
  const [form, setForm] = useState(FORM_VAZIO)
  const [erros, setErros] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [mensagem, setMensagem] = useState(null)

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setEnviando(true)
    setErros({})
    try {
      const novo = await cadastrarProduto(form)
      setMensagem({ tipo: 'ok', texto: `Produto cadastrado: ${novo.nome}.` })
      setForm(FORM_VAZIO)
      await recarregar()
    } catch (err) {
      const campos = err.campos || {}
      setErros(campos)
      setMensagem({
        tipo: 'erro',
        texto: Object.keys(campos).length ? 'O produto não foi cadastrado. Revise os campos marcados.' : err.message,
      })
    } finally {
      setEnviando(false)
    }
  }

  async function excluir(produto) {
    if (!confirm(`Excluir "${produto.nome}"? Essa ação não pode ser desfeita.`)) return
    try {
      const resp = await excluirProduto(produto.id)
      setMensagem({ tipo: 'ok', texto: resp.mensagem })
      await recarregar()
    } catch (err) {
      setMensagem({ tipo: 'erro', texto: err.message })
    }
  }

  const erroDo = (campo) => erros[campo] && <span className="erro-campo">{erros[campo][0]}</span>
  const invalido = (campo) => (erros[campo] ? 'true' : undefined)

  return (
    <section>
      <h1>Gerenciar produtos</h1>
      {mensagem && (
        <p className={`mensagem ${mensagem.tipo}`} role="status">{mensagem.texto}</p>
      )}

      <div className="painel">
        <form onSubmit={enviar} className="formulario">
          <h2>Novo produto</h2>

          <label htmlFor="nome">Nome</label>
          <input id="nome" name="nome" value={form.nome} onChange={alterar} aria-invalid={invalido('nome')} required />
          {erroDo('nome')}

          <label htmlFor="descricao">Descrição <span className="opcional">(opcional)</span></label>
          <textarea id="descricao" name="descricao" rows="3" value={form.descricao} onChange={alterar}
                    aria-invalid={invalido('descricao')} />
          {erroDo('descricao')}

          <label htmlFor="categoria">Categoria</label>
          <select id="categoria" name="categoria" value={form.categoria} onChange={alterar}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </select>
          {erroDo('categoria')}

          <div className="dupla">
            <div>
              <label htmlFor="preco">Preço (R$)</label>
              <input id="preco" name="preco" type="number" step="0.01" min="0" value={form.preco}
                     onChange={alterar} aria-invalid={invalido('preco')} required />
              {erroDo('preco')}
            </div>
            <div>
              <label htmlFor="estoque">Estoque</label>
              <input id="estoque" name="estoque" type="number" min="0" value={form.estoque}
                     onChange={alterar} aria-invalid={invalido('estoque')} required />
              {erroDo('estoque')}
            </div>
          </div>

          <button type="submit" className="botao" disabled={enviando}>
            {enviando ? 'Cadastrando…' : 'Cadastrar produto'}
          </button>
        </form>

        <div className="cadastrados">
          <h2>Cadastrados ({produtos.length})</h2>
          {produtos.length === 0 ? (
            <p className="vazio">Nenhum produto ainda. Use o formulário para cadastrar.</p>
          ) : (
            <div className="rolagem">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Produto</th>
                    <th scope="col">Categoria</th>
                    <th scope="col" className="num">Preço</th>
                    <th scope="col" className="num">Estoque</th>
                    <th scope="col"><span className="sr">Ações</span></th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nome}</td>
                      <td>{p.categoria}</td>
                      <td className="num">{formatarPreco(p.preco)}</td>
                      <td className="num">{p.estoque}</td>
                      <td className="acoes">
                        <button className="excluir" onClick={() => excluir(p)}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
