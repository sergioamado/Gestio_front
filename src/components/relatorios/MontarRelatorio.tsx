// src/components/relatorios/MontarRelatorio.tsx
// Construtor de relatórios: o gestor escolhe a fonte de dados, monta um relatório
// DETALHADO (colunas escolhidas) ou CRUZADO (linhas x colunas com totais), vê a prévia,
// baixa em PDF e pode salvar a montagem como modelo.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, ButtonGroup, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { FileEarmarkPdfFill, FunnelFill, PlusCircle, Save2Fill, Table as TableIcon, Trash3Fill, XCircle } from 'react-bootstrap-icons';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as service from '../../services/relatorioPersonalizadoService';
import type {
  Agregacao,
  CampoFonte,
  ConfigRelatorio,
  FonteRelatorio,
  ModeloRelatorio,
  Operador,
  ResultadoRelatorio,
  TipoCampo,
} from '../../types/relatorioPersonalizado';
import { alinhamentoDireita, formatarValor, textoTotal } from './formatarValor';

const LINHAS_PREVIA = 200;

const OPERADORES_POR_TIPO: Record<TipoCampo, { v: Operador; l: string }[]> = {
  texto: [
    { v: 'contem', l: 'contém' },
    { v: 'nao_contem', l: 'não contém' },
    { v: 'igual', l: 'é igual a' },
    { v: 'diferente', l: 'é diferente de' },
    { v: 'vazio', l: 'está vazio' },
    { v: 'nao_vazio', l: 'não está vazio' },
  ],
  numero: [
    { v: 'igual', l: '=' },
    { v: 'diferente', l: '≠' },
    { v: 'maior', l: '>' },
    { v: 'menor', l: '<' },
    { v: 'vazio', l: 'está vazio' },
    { v: 'nao_vazio', l: 'não está vazio' },
  ],
  moeda: [
    { v: 'igual', l: '=' },
    { v: 'diferente', l: '≠' },
    { v: 'maior', l: '>' },
    { v: 'menor', l: '<' },
  ],
  data: [
    { v: 'igual', l: 'no dia' },
    { v: 'maior', l: 'depois de' },
    { v: 'menor', l: 'antes de' },
    { v: 'vazio', l: 'está vazio' },
    { v: 'nao_vazio', l: 'não está vazio' },
  ],
  mes: [
    { v: 'igual', l: 'no mês' },
    { v: 'maior', l: 'depois de' },
    { v: 'menor', l: 'antes de' },
  ],
  booleano: [{ v: 'igual', l: 'é' }],
};

const AGREGACOES: { v: Agregacao; l: string }[] = [
  { v: 'soma', l: 'Soma' },
  { v: 'media', l: 'Média' },
  { v: 'minimo', l: 'Mínimo' },
  { v: 'maximo', l: 'Máximo' },
  { v: 'contagem', l: 'Quantidade' },
];

const ehNumerico = (t?: TipoCampo) => t === 'numero' || t === 'moeda';
/** Pode ser somado / tirado média (exclui números de identificação como Nº OS e ano). */
const ehAgregavel = (c?: CampoFonte) => !!c && ehNumerico(c.tipo) && c.agregavel !== false;
const ehDerivado = (key: string) => key.endsWith('_mes') || key.endsWith('_ano');

const configPadrao = (fonte: FonteRelatorio, tipo: 'detalhado' | 'cruzado' = 'detalhado'): ConfigRelatorio => {
  const primeiroTexto = fonte.campos.find((c) => c.tipo === 'texto')?.key ?? fonte.campos[0]?.key;
  return {
    fonte: fonte.id,
    tipo,
    titulo: '',
    periodo: { inicio: '', fim: '' },
    unidade_id: null,
    filtros: [],
    colunas: fonte.campos.filter((c) => !ehDerivado(c.key)).map((c) => c.key),
    ordenacao: null,
    linhas: primeiroTexto ? [primeiroTexto] : [],
    coluna: null,
    valores: [{ campo: '*', agregacao: 'contagem' }],
  };
};

export default function MontarRelatorio() {
  const { user } = useAuth();
  const { mostrarCard } = useToast();
  const { confirmar } = useConfirm();
  const isAdmin = user?.role === 'admin';

  const [fontes, setFontes] = useState<FonteRelatorio[]>([]);
  const [unidades, setUnidades] = useState<{ id: number; nome: string }[]>([]);
  const [modelos, setModelos] = useState<ModeloRelatorio[]>([]);
  const [config, setConfig] = useState<ConfigRelatorio | null>(null);
  const [modeloAtual, setModeloAtual] = useState<ModeloRelatorio | null>(null);
  const [resultado, setResultado] = useState<ResultadoRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [gerando, setGerando] = useState(false);
  const [baixando, setBaixando] = useState(false);

  const [modalSalvar, setModalSalvar] = useState<{ show: boolean; comoNovo: boolean }>({ show: false, comoNovo: true });
  const [formModelo, setFormModelo] = useState({ nome: '', descricao: '', compartilhado: false });
  const [salvando, setSalvando] = useState(false);

  const fonte = useMemo(() => fontes.find((f) => f.id === config?.fonte), [fontes, config?.fonte]);
  const campo = useCallback((key: string): CampoFonte | undefined => fonte?.campos.find((c) => c.key === key), [fonte]);
  const grupos = useMemo(() => Array.from(new Set(fontes.map((f) => f.grupo))), [fontes]);

  const carregarModelos = useCallback(async () => {
    try {
      setModelos(await service.getModelos());
    } catch {
      mostrarCard('Erro', 'Não foi possível carregar os modelos salvos.', 'erro');
    }
  }, [mostrarCard]);

  useEffect(() => {
    (async () => {
      try {
        const r = await service.getFontes();
        setFontes(r.fontes);
        setUnidades(r.unidades);
        if (r.fontes[0]) setConfig(configPadrao(r.fontes[0]));
        await carregarModelos();
      } catch {
        mostrarCard('Erro', 'Não foi possível carregar as fontes de dados do relatório.', 'erro');
      } finally {
        setCarregando(false);
      }
    })();
  }, [carregarModelos, mostrarCard]);

  const atualizar = (parcial: Partial<ConfigRelatorio>) => {
    setConfig((c) => (c ? { ...c, ...parcial } : c));
    setResultado(null);
  };

  const trocarFonte = (id: string) => {
    const f = fontes.find((x) => x.id === id);
    if (!f || !config) return;
    setConfig({ ...configPadrao(f, config.tipo), titulo: config.titulo, periodo: config.periodo, unidade_id: config.unidade_id });
    setResultado(null);
  };

  // ---------- modelos ----------
  const carregarModelo = (id: string) => {
    if (!id) {
      setModeloAtual(null);
      return;
    }
    const m = modelos.find((x) => x.id === Number(id));
    if (!m) return;
    if (!fontes.some((f) => f.id === m.configuracao.fonte)) {
      mostrarCard('Atenção', 'A fonte de dados deste modelo não está disponível para o seu perfil.', 'alerta');
      return;
    }
    setConfig({ ...configPadrao(fontes.find((f) => f.id === m.configuracao.fonte)!), ...m.configuracao });
    setModeloAtual(m);
    setResultado(null);
  };

  const podeEditarModelo = !!modeloAtual && (modeloAtual.usuario_id === user?.id || isAdmin);

  const abrirSalvar = (comoNovo: boolean) => {
    setFormModelo(
      !comoNovo && modeloAtual
        ? { nome: modeloAtual.nome, descricao: modeloAtual.descricao ?? '', compartilhado: modeloAtual.compartilhado }
        : { nome: config?.titulo || '', descricao: '', compartilhado: false },
    );
    setModalSalvar({ show: true, comoNovo });
  };

  const salvarModelo = async () => {
    if (!config) return;
    setSalvando(true);
    try {
      const dados = { ...formModelo, descricao: formModelo.descricao || null, configuracao: config };
      const salvo =
        !modalSalvar.comoNovo && modeloAtual
          ? await service.atualizarModelo(modeloAtual.id, dados)
          : await service.criarModelo(dados);
      await carregarModelos();
      setModeloAtual(salvo);
      setModalSalvar({ show: false, comoNovo: true });
      mostrarCard('Modelo Salvo', `O modelo "${salvo.nome}" foi salvo.`, 'sucesso');
    } catch (e: any) {
      mostrarCard('Erro', e.response?.data?.message || 'Não foi possível salvar o modelo.', 'erro');
    } finally {
      setSalvando(false);
    }
  };

  const excluirModelo = async () => {
    if (!modeloAtual) return;
    const ok = await confirmar({
      titulo: '🗑️ Excluir Modelo',
      mensagem: `Excluir o modelo "${modeloAtual.nome}"? O relatório montado na tela não é apagado.`,
      textoConfirmar: 'Sim, Excluir',
      varianteBotao: 'danger',
    });
    if (!ok) return;
    try {
      await service.excluirModelo(modeloAtual.id);
      setModeloAtual(null);
      await carregarModelos();
      mostrarCard('Modelo Excluído', 'O modelo foi excluído.', 'sucesso');
    } catch (e: any) {
      mostrarCard('Erro', e.response?.data?.message || 'Não foi possível excluir o modelo.', 'erro');
    }
  };

  // ---------- gerar / PDF ----------
  const validar = (): string | null => {
    if (!config) return 'Escolha uma fonte de dados.';
    if (config.tipo === 'detalhado' && !config.colunas?.length) return 'Escolha pelo menos uma coluna.';
    if (config.tipo === 'cruzado' && !config.linhas?.filter(Boolean).length) return 'Escolha pelo menos um campo para as linhas.';
    const filtroIncompleto = config.filtros.find((f) => !['vazio', 'nao_vazio'].includes(f.operador) && !f.valor?.trim());
    if (filtroIncompleto) return `Preencha o valor do filtro "${campo(filtroIncompleto.campo)?.label}".`;
    return null;
  };

  const configParaEnvio = (): ConfigRelatorio => ({
    ...config!,
    linhas: config!.linhas?.filter(Boolean),
    unidade_id: isAdmin ? config!.unidade_id ?? null : undefined,
  });

  const gerar = async () => {
    const erro = validar();
    if (erro) return mostrarCard('Atenção', erro, 'alerta');
    setGerando(true);
    try {
      const r = await service.gerar(configParaEnvio());
      setResultado(r);
      if (r.avisos.length) mostrarCard('Atenção', r.avisos.join('\n'), 'alerta', 8000);
    } catch (e: any) {
      mostrarCard('Erro', e.response?.data?.message || 'Não foi possível gerar o relatório.', 'erro');
    } finally {
      setGerando(false);
    }
  };

  const baixarPdf = async () => {
    const erro = validar();
    if (erro) return mostrarCard('Atenção', erro, 'alerta');
    setBaixando(true);
    try {
      // Sempre gera de novo, para o PDF refletir exatamente a montagem atual.
      const r = await service.gerar(configParaEnvio());
      setResultado(r);
      // jsPDF só é baixado quando o usuário pede o PDF (não pesa no carregamento da página).
      const { gerarPdfRelatorio } = await import('./gerarPdf');
      await gerarPdfRelatorio(r);
      mostrarCard('PDF Gerado', 'O download do relatório foi iniciado.', 'sucesso');
    } catch (e: any) {
      mostrarCard('Erro', e.response?.data?.message || 'Não foi possível gerar o PDF.', 'erro');
    } finally {
      setBaixando(false);
    }
  };

  if (carregando) {
    return (
      <Card className="border-0 shadow-sm mt-4 d-print-none">
        <Card.Body className="text-center py-5"><Spinner animation="border" variant="primary" /></Card.Body>
      </Card>
    );
  }
  if (!config || !fonte) return null;

  const camposNumericos = fonte.campos.filter((c) => ehAgregavel(c));
  const meusModelos = modelos.filter((m) => m.usuario_id === user?.id);
  const compartilhados = modelos.filter((m) => m.usuario_id !== user?.id);

  // Opções de ordenação do relatório cruzado (chaves das colunas de saída)
  const ordenacaoCruzado = [
    ...(config.linhas ?? []).filter(Boolean).map((k) => ({ key: k, label: campo(k)?.label ?? k })),
    ...(config.coluna
      ? [{ key: 'total', label: 'Total' }]
      : (config.valores ?? []).map((v, i) => ({
          key: `v${i}`,
          label: v.campo === '*' ? 'Quantidade de registros' : `${AGREGACOES.find((a) => a.v === v.agregacao)?.l} de ${campo(v.campo)?.label}`,
        }))),
  ];

  return (
    <Card className="border-0 shadow-sm mt-4 d-print-none">
      <Card.Header className="bg-white border-0 pt-4 pb-2 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h5 className="fw-bold text-dark mb-0"><TableIcon className="me-2" />Montar Relatório</h5>
          <small className="text-muted">
            Escolha os dados, cruze as informações e baixe em PDF.{' '}
            {!isAdmin && <>Os dados são sempre da sua unidade.</>}
          </small>
        </div>

        {/* MODELOS SALVOS */}
        <div className="d-flex flex-wrap gap-2 align-items-center">
          <Form.Select size="sm" style={{ minWidth: 230 }} value={modeloAtual?.id ?? ''} onChange={(e) => carregarModelo(e.target.value)} aria-label="Modelos salvos">
            <option value="">📂 Carregar modelo salvo…</option>
            {meusModelos.length > 0 && (
              <optgroup label="Meus modelos">
                {meusModelos.map((m) => <option key={m.id} value={m.id}>{m.nome}{m.compartilhado ? ' (compartilhado)' : ''}</option>)}
              </optgroup>
            )}
            {compartilhados.length > 0 && (
              <optgroup label="Compartilhados por outros gestores">
                {compartilhados.map((m) => <option key={m.id} value={m.id}>{m.nome} — {m.autor}</option>)}
              </optgroup>
            )}
          </Form.Select>
          {podeEditarModelo && (
            <>
              <Button size="sm" variant="outline-primary" onClick={() => abrirSalvar(false)}><Save2Fill className="me-1" />Atualizar modelo</Button>
              <Button size="sm" variant="outline-danger" onClick={excluirModelo} title="Excluir modelo"><Trash3Fill /></Button>
            </>
          )}
          <Button size="sm" variant="outline-secondary" onClick={() => abrirSalvar(true)}>
            <Save2Fill className="me-1" />{modeloAtual ? 'Salvar como novo' : 'Salvar como modelo'}
          </Button>
        </div>
      </Card.Header>

      <Card.Body className="pt-2">
        {/* 1. O QUE */}
        <Row className="g-3 mb-3">
          <Col lg={4}>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Fonte de dados</Form.Label>
            <Form.Select value={config.fonte} onChange={(e) => trocarFonte(e.target.value)}>
              {grupos.map((g) => (
                <optgroup key={g} label={g}>
                  {fontes.filter((f) => f.grupo === g).map((f) => <option key={f.id} value={f.id}>{f.nome}</option>)}
                </optgroup>
              ))}
            </Form.Select>
            <Form.Text className="text-muted small">{fonte.descricao}</Form.Text>
          </Col>
          <Col lg={4}>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Título do relatório</Form.Label>
            <Form.Control placeholder={fonte.nome} value={config.titulo ?? ''} maxLength={150} onChange={(e) => atualizar({ titulo: e.target.value })} />
          </Col>
          <Col lg={4}>
            <Form.Label className="small fw-bold text-secondary text-uppercase mb-1 d-block">Tipo</Form.Label>
            <ButtonGroup className="w-100">
              <Button variant={config.tipo === 'detalhado' ? 'primary' : 'outline-primary'} onClick={() => atualizar({ tipo: 'detalhado', ordenacao: null })}>
                Detalhado
              </Button>
              <Button variant={config.tipo === 'cruzado' ? 'primary' : 'outline-primary'} onClick={() => atualizar({ tipo: 'cruzado', ordenacao: null })}>
                Cruzado (agrupado)
              </Button>
            </ButtonGroup>
            <Form.Text className="text-muted small">
              {config.tipo === 'detalhado' ? 'Uma linha por registro, com as colunas que você escolher.' : 'Agrupa os dados em linhas × colunas, com totais.'}
            </Form.Text>
          </Col>
        </Row>

        {/* 2. RECORTE */}
        <Row className="g-3 mb-3">
          {fonte.tem_periodo && (
            <>
              <Col sm={6} lg={3}>
                <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Data inicial</Form.Label>
                <Form.Control type="date" value={config.periodo?.inicio ?? ''} onChange={(e) => atualizar({ periodo: { ...config.periodo, inicio: e.target.value } })} />
              </Col>
              <Col sm={6} lg={3}>
                <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Data final</Form.Label>
                <Form.Control type="date" value={config.periodo?.fim ?? ''} onChange={(e) => atualizar({ periodo: { ...config.periodo, fim: e.target.value } })} />
              </Col>
            </>
          )}
          {isAdmin && (
            <Col sm={6} lg={3}>
              <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Unidade</Form.Label>
              <Form.Select value={config.unidade_id ?? ''} onChange={(e) => atualizar({ unidade_id: e.target.value ? Number(e.target.value) : null })}>
                <option value="">Todas as unidades</option>
                {unidades.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </Form.Select>
            </Col>
          )}
        </Row>

        {/* 3. FILTROS */}
        <div className="bg-light rounded p-3 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="small fw-bold text-secondary text-uppercase"><FunnelFill className="me-1" />Filtros</span>
            <Button size="sm" variant="link" className="p-0 text-decoration-none" onClick={() => {
              const c = fonte.campos[0];
              atualizar({ filtros: [...config.filtros, { campo: c.key, operador: OPERADORES_POR_TIPO[c.tipo][0].v, valor: c.tipo === 'booleano' ? 'sim' : '' }] });
            }}>
              <PlusCircle className="me-1" />Adicionar filtro
            </Button>
          </div>
          {config.filtros.length === 0 && <div className="small text-muted">Nenhum filtro: todos os registros entram no relatório.</div>}
          {config.filtros.map((f, i) => {
            const c = campo(f.campo) ?? fonte.campos[0];
            const ops = OPERADORES_POR_TIPO[c.tipo];
            const semValor = f.operador === 'vazio' || f.operador === 'nao_vazio';
            const setFiltro = (parcial: Partial<typeof f>) =>
              atualizar({ filtros: config.filtros.map((x, j) => (j === i ? { ...x, ...parcial } : x)) });
            return (
              <Row key={i} className="g-2 mb-2 align-items-center">
                <Col md={4}>
                  <Form.Select size="sm" value={f.campo} onChange={(e) => {
                    const novo = campo(e.target.value)!;
                    setFiltro({ campo: novo.key, operador: OPERADORES_POR_TIPO[novo.tipo][0].v, valor: novo.tipo === 'booleano' ? 'sim' : '' });
                  }}>
                    {fonte.campos.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select size="sm" value={f.operador} onChange={(e) => setFiltro({ operador: e.target.value as Operador })}>
                    {ops.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  {semValor ? null : c.tipo === 'booleano' ? (
                    <Form.Select size="sm" value={f.valor} onChange={(e) => setFiltro({ valor: e.target.value })}>
                      <option value="sim">Sim</option>
                      <option value="nao">Não</option>
                    </Form.Select>
                  ) : (
                    <Form.Control
                      size="sm"
                      type={c.tipo === 'data' ? 'date' : c.tipo === 'mes' ? 'month' : ehNumerico(c.tipo) ? 'number' : 'text'}
                      step={c.tipo === 'moeda' ? '0.01' : undefined}
                      value={f.valor ?? ''}
                      onChange={(e) => setFiltro({ valor: e.target.value })}
                      placeholder="Valor"
                    />
                  )}
                </Col>
                <Col md={1} className="text-end">
                  <Button size="sm" variant="link" className="text-danger p-0" title="Remover filtro" onClick={() => atualizar({ filtros: config.filtros.filter((_, j) => j !== i) })}>
                    <XCircle />
                  </Button>
                </Col>
              </Row>
            );
          })}
        </div>

        {/* 4. MONTAGEM */}
        {config.tipo === 'detalhado' ? (
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="small fw-bold text-secondary text-uppercase">Colunas ({config.colunas?.length ?? 0})</span>
              <div className="d-flex gap-3">
                <Button size="sm" variant="link" className="p-0 text-decoration-none" onClick={() => atualizar({ colunas: fonte.campos.filter((c) => !ehDerivado(c.key)).map((c) => c.key) })}>Marcar todas</Button>
                <Button size="sm" variant="link" className="p-0 text-decoration-none" onClick={() => atualizar({ colunas: [] })}>Limpar</Button>
              </div>
            </div>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {fonte.campos.map((c) => {
                const marcado = config.colunas?.includes(c.key) ?? false;
                return (
                  <Button
                    key={c.key}
                    size="sm"
                    variant={marcado ? 'primary' : 'outline-secondary'}
                    className="rounded-pill"
                    aria-pressed={marcado}
                    onClick={() =>
                      atualizar({
                        colunas: marcado
                          ? (config.colunas ?? []).filter((k) => k !== c.key)
                          : [...(config.colunas ?? []), c.key], // mantém a ordem em que foram marcadas
                      })
                    }
                  >
                    {c.label}
                  </Button>
                );
              })}
            </div>
            <Row className="g-2">
              <Col sm={6} lg={4}>
                <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Ordenar por</Form.Label>
                <Form.Select size="sm" value={config.ordenacao?.campo ?? ''} onChange={(e) => atualizar({ ordenacao: e.target.value ? { campo: e.target.value, direcao: config.ordenacao?.direcao ?? 'asc' } : null })}>
                  <option value="">Ordem natural</option>
                  {fonte.campos.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </Form.Select>
              </Col>
              {config.ordenacao && (
                <Col sm={6} lg={3}>
                  <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Direção</Form.Label>
                  <Form.Select size="sm" value={config.ordenacao.direcao} onChange={(e) => atualizar({ ordenacao: { ...config.ordenacao!, direcao: e.target.value as 'asc' | 'desc' } })}>
                    <option value="asc">Crescente (A→Z, 0→9)</option>
                    <option value="desc">Decrescente (Z→A, 9→0)</option>
                  </Form.Select>
                </Col>
              )}
            </Row>
          </div>
        ) : (
          <Row className="g-3 mb-3">
            <Col lg={4}>
              <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Linhas (agrupar por)</Form.Label>
              {[0, 1, 2].map((i) => (i === 0 || config.linhas?.[i - 1]) ? (
                <Form.Select key={i} size="sm" className="mb-2" value={config.linhas?.[i] ?? ''} onChange={(e) => {
                  const linhas = [...(config.linhas ?? [])];
                  if (e.target.value) linhas[i] = e.target.value;
                  else linhas.splice(i);
                  atualizar({ linhas, ordenacao: null });
                }}>
                  <option value="">{i === 0 ? 'Escolha um campo' : `+ ${i + 1}º nível (opcional)`}</option>
                  {fonte.campos.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </Form.Select>
              ) : null)}
            </Col>
            <Col lg={3}>
              <Form.Label className="small fw-bold text-secondary text-uppercase mb-1">Colunas (cruzar com)</Form.Label>
              <Form.Select size="sm" value={config.coluna ?? ''} onChange={(e) => atualizar({ coluna: e.target.value || null, ordenacao: null })}>
                <option value="">Nenhum (mostrar só os valores)</option>
                {fonte.campos.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
              </Form.Select>
              <Form.Text className="text-muted small">Ex.: Técnico nas linhas × Mês nas colunas.</Form.Text>
            </Col>
            <Col lg={5}>
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span className="small fw-bold text-secondary text-uppercase">Valores {config.coluna ? '(nas células)' : ''}</span>
                {!config.coluna && (
                  <Button size="sm" variant="link" className="p-0 text-decoration-none" onClick={() => atualizar({ valores: [...(config.valores ?? []), { campo: camposNumericos[0]?.key ?? '*', agregacao: camposNumericos[0] ? 'soma' : 'contagem' }] })}>
                    <PlusCircle className="me-1" />Adicionar valor
                  </Button>
                )}
              </div>
              {(config.coluna ? (config.valores ?? []).slice(0, 1) : config.valores ?? []).map((v, i) => {
                const c = v.campo === '*' ? undefined : campo(v.campo);
                const setValor = (parcial: Partial<typeof v>) =>
                  atualizar({ valores: (config.valores ?? []).map((x, j) => (j === i ? { ...x, ...parcial } : x)), ordenacao: null });
                return (
                  <Row key={i} className="g-2 mb-2 align-items-center">
                    <Col xs={5}>
                      <Form.Select size="sm" value={v.agregacao} onChange={(e) => setValor({ agregacao: e.target.value as Agregacao })}>
                        {AGREGACOES.filter((a) => a.v === 'contagem' || ehAgregavel(c)).map((a) => <option key={a.v} value={a.v}>{a.l}</option>)}
                      </Form.Select>
                    </Col>
                    <Col xs={6}>
                      <Form.Select size="sm" value={v.campo} onChange={(e) => {
                        const novo = e.target.value === '*' ? undefined : campo(e.target.value);
                        setValor({ campo: e.target.value, agregacao: ehAgregavel(novo) ? v.agregacao : 'contagem' });
                      }}>
                        <option value="*">de registros</option>
                        {fonte.campos.map((x) => <option key={x.key} value={x.key}>de {x.label}</option>)}
                      </Form.Select>
                    </Col>
                    <Col xs={1} className="text-end">
                      {(config.valores?.length ?? 0) > 1 && (
                        <Button size="sm" variant="link" className="text-danger p-0" title="Remover" onClick={() => atualizar({ valores: (config.valores ?? []).filter((_, j) => j !== i), ordenacao: null })}>
                          <XCircle />
                        </Button>
                      )}
                    </Col>
                  </Row>
                );
              })}
              <Row className="g-2 mt-1">
                <Col xs={7}>
                  <Form.Select size="sm" value={config.ordenacao?.campo ?? ''} onChange={(e) => atualizar({ ordenacao: e.target.value ? { campo: e.target.value, direcao: config.ordenacao?.direcao ?? 'desc' } : null })} aria-label="Ordenar por">
                    <option value="">Ordenar pelas linhas (A→Z)</option>
                    {ordenacaoCruzado.map((o) => <option key={o.key} value={o.key}>Ordenar por {o.label}</option>)}
                  </Form.Select>
                </Col>
                {config.ordenacao && (
                  <Col xs={5}>
                    <Form.Select size="sm" value={config.ordenacao.direcao} onChange={(e) => atualizar({ ordenacao: { ...config.ordenacao!, direcao: e.target.value as 'asc' | 'desc' } })} aria-label="Direção">
                      <option value="desc">Maior → menor</option>
                      <option value="asc">Menor → maior</option>
                    </Form.Select>
                  </Col>
                )}
              </Row>
            </Col>
          </Row>
        )}

        {/* AÇÕES */}
        <div className="d-flex flex-wrap gap-2 justify-content-end border-top pt-3">
          <Button variant="outline-primary" onClick={gerar} disabled={gerando || baixando}>
            {gerando ? <Spinner size="sm" className="me-2" /> : <TableIcon className="me-2" />}Ver prévia
          </Button>
          <Button variant="danger" className="fw-bold" onClick={baixarPdf} disabled={gerando || baixando}>
            {baixando ? <Spinner size="sm" className="me-2" /> : <FileEarmarkPdfFill className="me-2" />}Baixar PDF
          </Button>
        </div>

        {/* PRÉVIA */}
        {resultado && (
          <div className="mt-4">
            <div className="d-flex flex-wrap justify-content-between align-items-end mb-2 gap-2">
              <div>
                <h6 className="fw-bold mb-0">{resultado.meta.titulo}</h6>
                <small className="text-muted">
                  {resultado.meta.unidade}
                  {resultado.meta.periodo ? ` · ${resultado.meta.periodo}` : ''}
                  {resultado.meta.filtros.length ? ` · Filtros: ${resultado.meta.filtros.join('; ')}` : ''}
                </small>
              </div>
              <Badge bg="secondary">{resultado.total_registros.toLocaleString('pt-BR')} registro(s)</Badge>
            </div>
            <div className="table-responsive border rounded" style={{ maxHeight: 480 }}>
              <Table striped hover size="sm" className="mb-0 small align-middle">
                <thead className="table-primary" style={{ position: 'sticky', top: 0 }}>
                  <tr>
                    {resultado.colunas.map((c) => (
                      <th key={c.key} className={`text-nowrap ${alinhamentoDireita(c.tipo) ? 'text-end' : ''}`}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultado.linhas.length === 0 ? (
                    <tr><td colSpan={resultado.colunas.length} className="text-center text-muted py-4">Nenhum registro encontrado com os filtros escolhidos.</td></tr>
                  ) : (
                    resultado.linhas.slice(0, LINHAS_PREVIA).map((l, i) => (
                      <tr key={i}>
                        {resultado.colunas.map((c) => (
                          <td key={c.key} className={alinhamentoDireita(c.tipo) ? 'text-end text-nowrap' : ''}>{formatarValor(l[c.key], c.tipo)}</td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
                {resultado.totais && resultado.linhas.length > 0 && (
                  <tfoot className="table-light fw-bold">
                    <tr>
                      {resultado.colunas.map((c, i) => (
                        <td key={c.key} className={alinhamentoDireita(c.tipo) ? 'text-end text-nowrap' : ''}>
                          {textoTotal(i, c.key in resultado.totais!, c.key in resultado.totais! ? formatarValor(resultado.totais![c.key], c.tipo) : '')}
                        </td>
                      ))}
                    </tr>
                  </tfoot>
                )}
              </Table>
            </div>
            {resultado.linhas.length > LINHAS_PREVIA && (
              <small className="text-muted">
                Prévia com as primeiras {LINHAS_PREVIA} de {resultado.linhas.length.toLocaleString('pt-BR')} linhas. O PDF contém todas.
              </small>
            )}
          </div>
        )}
      </Card.Body>

      {/* MODAL: SALVAR MODELO */}
      <Modal show={modalSalvar.show} onHide={() => setModalSalvar({ show: false, comoNovo: true })} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">{modalSalvar.comoNovo ? '💾 Salvar como modelo' : '💾 Atualizar modelo'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Nome do modelo</Form.Label>
            <Form.Control autoFocus maxLength={150} value={formModelo.nome} placeholder="Ex.: Produção mensal por técnico" onChange={(e) => setFormModelo({ ...formModelo, nome: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Descrição (opcional)</Form.Label>
            <Form.Control as="textarea" rows={2} maxLength={500} value={formModelo.descricao} onChange={(e) => setFormModelo({ ...formModelo, descricao: e.target.value })} />
          </Form.Group>
          <Form.Check
            type="switch"
            id="modelo-compartilhado"
            label="Compartilhar com os outros gestores"
            checked={formModelo.compartilhado}
            onChange={(e) => setFormModelo({ ...formModelo, compartilhado: e.target.checked })}
          />
          <Form.Text className="text-muted small">
            O modelo guarda só a montagem. Cada gestor que usar verá apenas os dados da própria unidade.
          </Form.Text>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setModalSalvar({ show: false, comoNovo: true })}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={salvarModelo} disabled={salvando || formModelo.nome.trim().length < 3}>
            {salvando && <Spinner size="sm" className="me-2" />}Salvar
          </Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
}
