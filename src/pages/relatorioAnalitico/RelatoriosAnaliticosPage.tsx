// src/pages/relatorioAnalitico/RelatoriosAnaliticosPage.tsx
// Relatório Analítico: laudo de equipamentos sem conserto (inservíveis).
// Técnico emite → gerente (coordenador) da unidade assina ou devolve → PDF numerado e verificável.
import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Col, Form, InputGroup, Modal, Row, Spinner, Table } from 'react-bootstrap';
import {
  ArrowReturnLeft, Files, FileEarmarkPdfFill, PencilSquare, PenFill, PlusCircle, Search, ShieldCheck, Trash3Fill, XCircle, XOctagonFill,
} from 'react-bootstrap-icons';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import { useAuth } from '../../hooks/useAuth';
import { useTempoReal } from '../../hooks/useTempoReal';
import { useToast } from '../../contexts/ToastContext';
import { useConfirm } from '../../contexts/ConfirmContext';
import * as service from '../../services/relatorioAnaliticoService';
import type {
  ItemRelatorioAnalitico, RelatorioAnalitico, StatusRelatorioAnalitico, VerificacaoRelatorioAnalitico,
} from '../../types/relatorioAnalitico';

const STATUS: Record<StatusRelatorioAnalitico, { label: string; bg: string; text?: string }> = {
  PENDENTE: { label: 'Aguardando assinatura', bg: 'warning', text: 'dark' },
  DEVOLVIDO: { label: 'Devolvido para correção', bg: 'secondary' },
  ASSINADO: { label: 'Assinado', bg: 'success' },
  ANULADO: { label: 'Anulado', bg: 'danger' },
};

const dataBR = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const itemVazio = (): ItemRelatorioAnalitico => ({ equipamento: '', patrimonio: '' });

export default function RelatoriosAnaliticosPage() {
  const { user } = useAuth();
  const { mostrarCard } = useToast();
  const { confirmar } = useConfirm();
  const isTecnico = user?.role?.startsWith('tecnico') ?? false;
  const isGerente = user?.role === 'gerente';

  const [lista, setLista] = useState<RelatorioAnalitico[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState({ status: '', ano: '', busca: '' });
  const [acaoEmAndamento, setAcaoEmAndamento] = useState<number | null>(null);

  // Formulário (novo / editar)
  const [form, setForm] = useState<{ show: boolean; editando: RelatorioAnalitico | null; itens: ItemRelatorioAnalitico[] }>({
    show: false, editando: null, itens: [itemVazio()],
  });
  const [salvando, setSalvando] = useState(false);

  // Assinar / devolver / anular
  const [assinatura, setAssinatura] = useState<{ r: RelatorioAnalitico | null; cargo: string; revisei: boolean }>({ r: null, cargo: '', revisei: false });
  const [motivo, setMotivo] = useState<{ r: RelatorioAnalitico | null; tipo: 'devolver' | 'anular'; texto: string }>({ r: null, tipo: 'devolver', texto: '' });

  // Verificar autenticidade
  const [verif, setVerif] = useState<{ show: boolean; codigo: string; resultado: VerificacaoRelatorioAnalitico | null; erro: string | null; buscando: boolean }>({
    show: false, codigo: '', resultado: null, erro: null, buscando: false,
  });

  // silencioso = recarga em tempo real (sem spinner e sem card de erro repetido)
  const carregar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCarregando(true);
    try {
      setLista(await service.listar({ status: filtros.status || undefined, ano: filtros.ano || undefined, busca: filtros.busca.trim() || undefined }));
    } catch {
      if (!silencioso) mostrarCard('Erro', 'Não foi possível carregar os relatórios analíticos.', 'erro');
    } finally {
      if (!silencioso) setCarregando(false);
    }
  }, [filtros, mostrarCard]);

  useEffect(() => {
    const t = setTimeout(() => carregar(), 300); // pequena espera para a busca não disparar a cada tecla
    return () => clearTimeout(t);
  }, [carregar]);

  // Tempo real: outro usuário emitiu, corrigiu, assinou, devolveu ou anulou → a lista se atualiza sozinha.
  useTempoReal(['relatorios_analiticos'], () => carregar(true));

  // Se o relatório aberto numa janela mudou de situação por outra pessoa (ex.: outro gerente assinou),
  // fecha a janela para ninguém agir sobre um estado velho.
  useEffect(() => {
    const mudou = (r: RelatorioAnalitico | null) => {
      if (!r) return false;
      const atual = lista.find((x) => x.id === r.id);
      return !atual || atual.status !== r.status;
    };
    const avisar = () =>
      mostrarCard('Relatório Atualizado', 'Este relatório foi alterado por outro usuário. Confira a situação atual na lista.', 'info');
    if (mudou(assinatura.r)) { setAssinatura({ r: null, cargo: '', revisei: false }); avisar(); }
    if (mudou(motivo.r)) { setMotivo({ r: null, tipo: 'devolver', texto: '' }); avisar(); }
    if (form.show && mudou(form.editando)) { setForm({ show: false, editando: null, itens: [itemVazio()] }); avisar(); }
    // Só reage à chegada de uma lista nova.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lista]);

  const erroDe = (e: unknown, padrao: string) =>
    (e as { response?: { data?: { message?: string } } })?.response?.data?.message || padrao;

  // ---------- PDF ----------
  const baixarPdf = async (r: RelatorioAnalitico) => {
    setAcaoEmAndamento(r.id);
    try {
      const { gerarPdfRelatorioAnalitico } = await import('../../components/relatorioAnalitico/gerarPdfRelatorioAnalitico');
      await gerarPdfRelatorioAnalitico(r);
    } catch {
      mostrarCard('Erro', 'Não foi possível gerar o PDF.', 'erro');
    } finally {
      setAcaoEmAndamento(null);
    }
  };

  // ---------- formulário ----------
  const abrirNovo = () => setForm({ show: true, editando: null, itens: [itemVazio()] });
  const abrirEditar = (r: RelatorioAnalitico) =>
    setForm({ show: true, editando: r, itens: r.itens.map(({ equipamento, patrimonio }) => ({ equipamento, patrimonio })) });

  const setItem = (i: number, campo: keyof ItemRelatorioAnalitico, valor: string) =>
    setForm((f) => ({ ...f, itens: f.itens.map((it, j) => (j === i ? { ...it, [campo]: valor } : it)) }));

  const salvar = async () => {
    const itens = form.itens
      .map((i) => ({ equipamento: i.equipamento.trim(), patrimonio: i.patrimonio.trim() }))
      .filter((i) => i.equipamento || i.patrimonio);
    if (!itens.length) return mostrarCard('Atenção', 'Inclua pelo menos um equipamento.', 'alerta');
    const incompleto = itens.findIndex((i) => !i.equipamento || !i.patrimonio);
    if (incompleto >= 0) return mostrarCard('Atenção', `Preencha o equipamento e o patrimônio da linha ${incompleto + 1}.`, 'alerta');
    const repetidos = itens.map((i) => i.patrimonio.toUpperCase()).filter((p, i, a) => a.indexOf(p) !== i);
    if (repetidos.length) return mostrarCard('Atenção', `Patrimônio repetido na lista: ${[...new Set(repetidos)].join(', ')}.`, 'alerta');

    setSalvando(true);
    try {
      const salvo = form.editando ? await service.atualizar(form.editando.id, itens) : await service.criar(itens);
      setForm({ show: false, editando: null, itens: [itemVazio()] });
      mostrarCard(
        form.editando ? 'Relatório Atualizado' : 'Relatório Emitido',
        'Enviado para a assinatura do coordenador da unidade.',
        'sucesso',
      );
      if (salvo.avisos?.length) mostrarCard('Atenção', salvo.avisos.join('\n'), 'alerta', 10000);
      carregar();
    } catch (e) {
      mostrarCard('Erro', erroDe(e, 'Não foi possível salvar o relatório.'), 'erro');
    } finally {
      setSalvando(false);
    }
  };

  // ---------- ações ----------
  const executar = async (r: RelatorioAnalitico, fn: () => Promise<unknown>, sucesso: [string, string]) => {
    setAcaoEmAndamento(r.id);
    try {
      await fn();
      mostrarCard(sucesso[0], sucesso[1], 'sucesso');
      carregar();
    } catch (e) {
      mostrarCard('Erro', erroDe(e, 'Não foi possível concluir a ação.'), 'erro');
    } finally {
      setAcaoEmAndamento(null);
    }
  };

  const excluir = async (r: RelatorioAnalitico) => {
    const ok = await confirmar({
      titulo: '🗑️ Excluir minuta',
      mensagem: 'Excluir esta minuta de Relatório Analítico? Ela ainda não foi assinada e não tem número.',
      textoConfirmar: 'Sim, Excluir',
      varianteBotao: 'danger',
    });
    if (ok) executar(r, () => service.excluir(r.id), ['Minuta Excluída', 'A minuta foi excluída.']);
  };

  const gerarNovo = async (r: RelatorioAnalitico) => {
    const ok = await confirmar({
      titulo: '📄 Gerar novo relatório',
      mensagem: `Criar um novo Relatório Analítico com os mesmos ${r.itens.length} equipamento(s)${r.numero_formatado ? ` do nº ${r.numero_formatado}` : ''}? Ele irá para a assinatura do coordenador e receberá um novo número.`,
      textoConfirmar: 'Sim, Gerar Novo',
      varianteBotao: 'primary',
    });
    if (ok) executar(r, () => service.duplicar(r.id), ['Novo Relatório Emitido', 'Enviado para a assinatura do coordenador.']);
  };

  const abrirAssinar = async (r: RelatorioAnalitico) => {
    let cargo = 'Coordenador(a) de Suporte';
    try {
      cargo = await service.cargoSugerido();
    } catch {
      /* usa o padrão */
    }
    setAssinatura({ r, cargo, revisei: false });
  };

  const assinar = async () => {
    const r = assinatura.r!;
    setAssinatura((a) => ({ ...a, r: null }));
    await executar(r, () => service.assinar(r.id, assinatura.cargo.trim()), ['Relatório Assinado', 'O documento foi numerado e assinado eletronicamente.']);
  };

  const enviarMotivo = async () => {
    const { r, tipo, texto } = motivo;
    setMotivo((m) => ({ ...m, r: null }));
    if (tipo === 'devolver') await executar(r!, () => service.devolver(r!.id, texto.trim()), ['Relatório Devolvido', 'O técnico foi avisado para corrigir.']);
    else await executar(r!, () => service.anular(r!.id, texto.trim()), ['Relatório Anulado', 'O documento foi anulado. O número continua reservado.']);
  };

  const verificar = async () => {
    setVerif((v) => ({ ...v, buscando: true, resultado: null, erro: null }));
    try {
      const resultado = await service.verificar(verif.codigo);
      setVerif((v) => ({ ...v, buscando: false, resultado }));
    } catch (e) {
      setVerif((v) => ({ ...v, buscando: false, erro: erroDe(e, 'Não foi possível verificar o código.') }));
    }
  };

  const anoAtual = new Date().getFullYear();

  return (
    <MainLayout pageTitle="📄 Relatório Analítico">
      {/* CABEÇALHO E FILTROS */}
      <Card className="floating-card border-0 shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-1">Relatórios Analíticos</h5>
              <small className="text-muted">Laudos de equipamentos sem viabilidade de conserto, assinados pelo coordenador da unidade.</small>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="outline-secondary" onClick={() => setVerif({ show: true, codigo: '', resultado: null, erro: null, buscando: false })}>
                <ShieldCheck className="me-2" />Verificar autenticidade
              </Button>
              {isTecnico && (
                <PrimaryButton onClick={abrirNovo}>
                  <PlusCircle className="me-2" />Novo Relatório Analítico
                </PrimaryButton>
              )}
            </div>
          </div>
          <Row className="g-2">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-light border-0"><Search /></InputGroup.Text>
                <Form.Control
                  className="bg-light border-0"
                  placeholder="Patrimônio, equipamento, nº (ex.: 3/2026) ou código"
                  value={filtros.busca}
                  onChange={(e) => setFiltros((f) => ({ ...f, busca: e.target.value }))}
                />
              </InputGroup>
            </Col>
            <Col sm={6} md={4}>
              <Form.Select className="bg-light border-0" value={filtros.status} onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value }))}>
                <option value="">Todos os status</option>
                {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </Form.Select>
            </Col>
            <Col sm={6} md={3}>
              <Form.Select className="bg-light border-0" value={filtros.ano} onChange={(e) => setFiltros((f) => ({ ...f, ano: e.target.value }))}>
                <option value="">Todos os anos</option>
                {[anoAtual, anoAtual - 1, anoAtual - 2, anoAtual - 3].map((a) => <option key={a} value={a}>{a}</option>)}
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* LISTA */}
      <Card className="floating-card border-0 shadow-sm">
        <Card.Body className="p-0 p-sm-3">
          {carregando ? (
            <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
          ) : lista.length === 0 ? (
            <div className="text-center text-muted py-5">
              <div className="fs-1 mb-2">📄</div>
              Nenhum relatório analítico encontrado.
              {isTecnico && <div className="small mt-1">Use "Novo Relatório Analítico" para emitir o primeiro.</div>}
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0 tabela-cards">
              <thead className="table-light">
                <tr>
                  <th>Nº</th>
                  <th>Equipamentos</th>
                  <th>Técnico</th>
                  <th>Data</th>
                  <th>Status</th>
                  <th className="text-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((r) => {
                  const st = STATUS[r.status];
                  const dono = r.tecnico_id === user?.id;
                  const editavel = dono && (r.status === 'PENDENTE' || r.status === 'DEVOLVIDO');
                  const gerenteDaUnidade = isGerente && user?.unidade_id === r.unidade_id;
                  const ocupado = acaoEmAndamento === r.id;
                  return (
                    <tr key={r.id}>
                      <td data-label="Nº" className="fw-bold text-nowrap">
                        {r.numero_formatado ? `${r.numero_formatado}${r.unidade.sigla ? ` – ${r.unidade.sigla}` : ''}` : <span className="text-muted fw-normal">minuta</span>}
                      </td>
                      <td data-label="Equipamentos" className="bloco">
                        <span className="fw-medium">{r.itens.length} equipamento(s)</span>
                        <div className="small text-muted">
                          {r.itens.slice(0, 3).map((i) => `${i.equipamento} (${i.patrimonio})`).join(', ')}
                          {r.itens.length > 3 ? '…' : ''}
                        </div>
                        {r.status === 'DEVOLVIDO' && r.motivo_devolucao && (
                          <div className="small text-danger mt-1">↩️ {r.motivo_devolucao}</div>
                        )}
                        {r.status === 'ANULADO' && r.motivo_anulacao && <div className="small text-danger mt-1">⛔ {r.motivo_anulacao}</div>}
                      </td>
                      <td data-label="Técnico" className="small">{r.tecnico.nome_completo}</td>
                      <td data-label="Data" className="small text-nowrap bloco">
                        {r.assinado_em ? <>Assinado {dataBR(r.assinado_em)}<div className="text-muted">por {r.assinado_por?.nome_completo}</div></> : <>Emitido {dataBR(r.criado_em)}</>}
                      </td>
                      <td data-label="Status"><Badge bg={st.bg} text={st.text}>{st.label}</Badge></td>
                      <td className="text-center acoes">
                        <div className="d-flex flex-wrap justify-content-center gap-1">
                          <Button size="sm" variant="outline-danger" disabled={ocupado} onClick={() => baixarPdf(r)} title={r.status === 'ASSINADO' || r.status === 'ANULADO' ? 'Baixar o documento' : 'Baixar a minuta'}>
                            {ocupado ? <Spinner size="sm" /> : <FileEarmarkPdfFill />} PDF
                          </Button>
                          {editavel && (
                            <>
                              <Button size="sm" variant="outline-primary" disabled={ocupado} onClick={() => abrirEditar(r)}><PencilSquare /> Editar</Button>
                              <Button size="sm" variant="outline-secondary" disabled={ocupado} onClick={() => excluir(r)} title="Excluir minuta"><Trash3Fill /></Button>
                            </>
                          )}
                          {gerenteDaUnidade && r.status === 'PENDENTE' && (
                            <>
                              <Button size="sm" variant="success" disabled={ocupado} onClick={() => abrirAssinar(r)}><PenFill /> Assinar</Button>
                              <Button size="sm" variant="outline-warning" disabled={ocupado} onClick={() => setMotivo({ r, tipo: 'devolver', texto: '' })}><ArrowReturnLeft /> Devolver</Button>
                            </>
                          )}
                          {gerenteDaUnidade && r.status === 'ASSINADO' && (
                            <Button size="sm" variant="outline-danger" disabled={ocupado} onClick={() => setMotivo({ r, tipo: 'anular', texto: '' })} title="Anular documento"><XOctagonFill /> Anular</Button>
                          )}
                          {isTecnico && user?.unidade_id === r.unidade_id && (r.status === 'ASSINADO' || r.status === 'ANULADO') && (
                            <Button size="sm" variant="outline-secondary" disabled={ocupado} onClick={() => gerarNovo(r)} title="Gerar um novo relatório com os mesmos equipamentos"><Files /> Gerar novo</Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* MODAL: NOVO / EDITAR */}
      <Modal show={form.show} onHide={() => !salvando && setForm((f) => ({ ...f, show: false }))} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">{form.editando ? '✏️ Editar Relatório Analítico' : '📄 Novo Relatório Analítico'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {form.editando?.status === 'DEVOLVIDO' && form.editando.motivo_devolucao && (
            <div className="small text-danger bg-danger-subtle rounded p-2 mb-3">↩️ Devolvido pelo coordenador: {form.editando.motivo_devolucao}</div>
          )}
          <p className="small text-muted">
            Liste os equipamentos avaliados <strong>sem viabilidade de conserto</strong>. O texto do documento é o padrão da COSUP;
            o número e a assinatura são aplicados pelo coordenador.
          </p>
          {form.itens.map((it, i) => (
            <Row key={i} className="g-2 mb-2 align-items-center">
              <Col xs={12} sm={6}>
                <Form.Control
                  placeholder="Equipamento (ex.: COMPUTADOR)"
                  value={it.equipamento}
                  maxLength={200}
                  aria-label={`Equipamento da linha ${i + 1}`}
                  onChange={(e) => setItem(i, 'equipamento', e.target.value)}
                />
              </Col>
              <Col xs={10} sm={5}>
                <Form.Control
                  placeholder="Patrimônio (ex.: 207196)"
                  value={it.patrimonio}
                  maxLength={60}
                  aria-label={`Patrimônio da linha ${i + 1}`}
                  onChange={(e) => setItem(i, 'patrimonio', e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && i === form.itens.length - 1) {
                      e.preventDefault();
                      setForm((f) => ({ ...f, itens: [...f.itens, itemVazio()] }));
                    }
                  }}
                />
              </Col>
              <Col xs={2} sm={1} className="text-end">
                {form.itens.length > 1 && (
                  <Button variant="link" className="text-danger p-0" title="Remover linha" aria-label={`Remover linha ${i + 1}`}
                    onClick={() => setForm((f) => ({ ...f, itens: f.itens.filter((_, j) => j !== i) }))}>
                    <XCircle size={20} />
                  </Button>
                )}
              </Col>
            </Row>
          ))}
          <Button variant="link" className="p-0 text-decoration-none" onClick={() => setForm((f) => ({ ...f, itens: [...f.itens, itemVazio()] }))}>
            <PlusCircle className="me-1" />Adicionar equipamento
          </Button>
          <div className="small text-muted mt-1">Dica: Enter no último patrimônio adiciona uma nova linha.</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setForm((f) => ({ ...f, show: false }))} disabled={salvando}>Cancelar</Button>
          <Button variant="primary" size="sm" onClick={salvar} disabled={salvando}>
            {salvando && <Spinner size="sm" className="me-2" />}
            {form.editando ? 'Salvar e reenviar para assinatura' : 'Emitir e enviar para assinatura'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: ASSINAR */}
      <Modal show={!!assinatura.r} onHide={() => setAssinatura((a) => ({ ...a, r: null }))} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">✍️ Assinar Relatório Analítico</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="small mb-2">Emitido por <strong>{assinatura.r?.tecnico.nome_completo}</strong> com os equipamentos:</p>
          <div className="border rounded mb-3" style={{ maxHeight: 200, overflowY: 'auto' }}>
            <Table size="sm" className="mb-0 small">
              <thead className="table-light"><tr><th>Equipamento</th><th>Patrimônio</th></tr></thead>
              <tbody>{assinatura.r?.itens.map((i) => <tr key={i.id}><td>{i.equipamento}</td><td>{i.patrimonio}</td></tr>)}</tbody>
            </Table>
          </div>
          <Form.Group className="mb-3">
            <Form.Label className="small fw-bold">Cargo que aparecerá na assinatura</Form.Label>
            <Form.Control value={assinatura.cargo} maxLength={150} onChange={(e) => setAssinatura((a) => ({ ...a, cargo: e.target.value }))} />
          </Form.Group>
          <Form.Check
            id="revisei-relatorio"
            label="Revisei o relatório e confirmo a assinatura eletrônica deste documento."
            checked={assinatura.revisei}
            onChange={(e) => setAssinatura((a) => ({ ...a, revisei: e.target.checked }))}
          />
          <div className="small text-muted mt-2">O documento receberá o próximo número da unidade e um código de verificação. Depois de assinado, não pode ser alterado (apenas anulado).</div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setAssinatura((a) => ({ ...a, r: null }))}>Cancelar</Button>
          <Button variant="success" size="sm" onClick={assinar} disabled={!assinatura.revisei || assinatura.cargo.trim().length < 3}>
            <PenFill className="me-1" />Assinar eletronicamente
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: DEVOLVER / ANULAR */}
      <Modal show={!!motivo.r} onHide={() => setMotivo((m) => ({ ...m, r: null }))} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">
            {motivo.tipo === 'devolver' ? '↩️ Devolver para correção' : `⛔ Anular Relatório Analítico nº ${motivo.r?.numero_formatado ?? ''}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {motivo.tipo === 'anular' && (
            <p className="small text-danger">O documento continuará registrado com a tarja "ANULADO" e o número não será reutilizado.</p>
          )}
          <Form.Label className="small fw-bold">Motivo</Form.Label>
          <Form.Control as="textarea" rows={3} maxLength={1000} autoFocus value={motivo.texto}
            placeholder={motivo.tipo === 'devolver' ? 'Ex.: o patrimônio 207196 está incorreto.' : 'Ex.: documento emitido em duplicidade.'}
            onChange={(e) => setMotivo((m) => ({ ...m, texto: e.target.value }))} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" size="sm" onClick={() => setMotivo((m) => ({ ...m, r: null }))}>Cancelar</Button>
          <Button variant={motivo.tipo === 'devolver' ? 'warning' : 'danger'} size="sm" onClick={enviarMotivo} disabled={motivo.texto.trim().length < 5}>
            {motivo.tipo === 'devolver' ? 'Devolver ao técnico' : 'Anular documento'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL: VERIFICAR AUTENTICIDADE */}
      <Modal show={verif.show} onHide={() => setVerif((v) => ({ ...v, show: false }))} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fs-6 fw-bold">🛡️ Verificar autenticidade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Label className="small fw-bold">Código de verificação (impresso no documento)</Form.Label>
          <InputGroup className="mb-3">
            <Form.Control placeholder="Ex.: A1B2-C3D4-E5F6-0789" value={verif.codigo}
              onChange={(e) => setVerif((v) => ({ ...v, codigo: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && verif.codigo.trim() && verificar()} />
            <Button onClick={verificar} disabled={!verif.codigo.trim() || verif.buscando}>{verif.buscando ? <Spinner size="sm" /> : 'Verificar'}</Button>
          </InputGroup>
          {verif.erro && <div className="small text-danger">❌ {verif.erro}</div>}
          {verif.resultado && (
            <div className={`rounded p-3 small ${verif.resultado.valido ? 'bg-success-subtle' : 'bg-danger-subtle'}`}>
              <div className="fw-bold mb-1">
                {verif.resultado.valido ? '✅ Documento autêntico e válido' : `⛔ Documento ${verif.resultado.status === 'ANULADO' ? 'ANULADO' : 'sem validade'}`}
              </div>
              <div>Relatório Analítico nº <strong>{verif.resultado.numero_formatado}</strong> – {verif.resultado.unidade}</div>
              <div>Assinado por {verif.resultado.assinado_por} em {dataBR(verif.resultado.assinado_em)}</div>
              {verif.resultado.anulado_em && <div className="text-danger">Anulado em {dataBR(verif.resultado.anulado_em)}: {verif.resultado.motivo_anulacao}</div>}
              <div className="mt-2">Equipamentos: {verif.resultado.itens.map((i) => `${i.equipamento} (${i.patrimonio})`).join(', ')}</div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </MainLayout>
  );
}
