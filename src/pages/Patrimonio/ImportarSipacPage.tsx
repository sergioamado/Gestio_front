// src/pages/Patrimonio/ImportarSipacPage.tsx
import { useToast } from '../../contexts/ToastContext';
import { useState, useEffect } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import MainLayout from '../../layouts/MainLayout';
import PrimaryButton from '../../components/PrimaryButton';
import api from '../../services/api';
import * as unidadeService from '../../services/unidadeService';
import * as patrimonioService from '../../services/patrimonioService';
import { useAuth } from '../../hooks/useAuth';
import type { Unidade } from '../../types';

import ModalForm from '../../components/ModalForm';
import BemForm from '../../components/patrimonio/BemForm';

function ImportarSipacPage() {
  const { mostrarCard } = useToast();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [unidades, setUnidades] = useState<Unidade[]>([]);
  const [unidadeDestinoId, setUnidadeDestinoId] = useState('');
  
  const [loading, setLoading] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //  CONTROLO DE ACESSO: Apenas Admin e Gerente
  const hasAccess = user?.role === 'admin' || user?.role === 'gerente';

  useEffect(() => {
    //  Evita chamadas à API caso o usuário não tenha permissão
    if (user && hasAccess) {
      unidadeService.getAllUnidades().then(setUnidades).catch(console.error);
      if (user.role !== 'admin' && user.unidade_id) {
        setUnidadeDestinoId(String(user.unidade_id));
      }
    }
  }, [user, hasAccess]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setFile(e.target.files[0]);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !unidadeDestinoId) {
      mostrarCard('Atenção', 'Por favor, preencha a Unidade e selecione o arquivo.', 'alerta');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('planilha', file); 
    formData.append('unidade_id', unidadeDestinoId); 

    try {
      const response = await api.post('/patrimonio/importar', formData);
      const d = response.data.detalhes;
      mostrarCard(
        'Importação Concluída',
        d
          ? `${response.data.message}\nEncontrados: ${d.total_bens_encontrados} · Novos: ${d.novos_registos} · Atualizados: ${d.atualizados}${d.vindos_de_outra_unidade ? ` (${d.vindos_de_outra_unidade} vieram de outra unidade)` : ''} · Erros/Ignorados: ${d.erros}`
          : response.data.message,
        'sucesso',
        12000,
      );
      setFile(null); 
    } catch (err: any) {
      mostrarCard('Erro na Importação', err.response?.data?.message || 'Erro ao processar o arquivo. Tente salvar o PDF novamente ou use o formato CSV.', 'erro', 8000);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      await patrimonioService.createBem(data);
      setShowFormModal(false);
      mostrarCard('Sucesso', `Tombamento ${data.tombamento} cadastrado com sucesso!`, 'sucesso');
    } catch (err: any) {
      mostrarCard('Erro', err.response?.data?.message || 'Erro ao cadastrar bem manualmente.', 'erro');
    } finally {
      setIsSubmitting(false);
    }
  };

  //  TELA DE BLOQUEIO: Exibida se o usuário não for Admin ou Gerente
  if (!user || !hasAccess) {
    return (
      <MainLayout pageTitle="🚫 Acesso Restrito">
        <Alert variant="danger" className="shadow-sm border-0 mt-4 d-flex align-items-center p-4">
          <span className="fs-1 me-3">🔒</span>
          <div>
            <h5 className="fw-bold mb-1">Acesso Negado</h5>
            Apenas administradores e gerentes têm permissão para acessar, importar ou modificar dados patrimoniais.
          </div>
        </Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout pageTitle="📄 Importar Relatório SIPAC">
      <Card className="floating-card border-0 shadow-sm max-w-lg mx-auto mt-4" style={{ maxWidth: '600px' }}>
        <Card.Body className="p-5">
          <div className="text-center mb-4">
            <span className="display-4 d-block mb-3">📑</span>
            <Card.Title className="fw-bold fs-4 text-dark">Sincronização Patrimonial</Card.Title>
            <p className="text-muted">Faça o upload do seu relatório ou insira os itens manualmente.</p>
          </div>


          <Form onSubmit={handleImport}>
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary">1. Unidade de Destino</Form.Label>
              <Form.Select value={unidadeDestinoId} onChange={(e) => setUnidadeDestinoId(e.target.value)} required disabled={user?.role !== 'admin'} className="bg-light border-0 shadow-sm">
                <option value="">Selecione o setor...</option>
                {unidades.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold text-secondary">2. Arquivo SIPAC (.pdf, .csv, .xlsx)</Form.Label>
              <Form.Control type="file" accept=".pdf, .csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" onChange={handleFileChange} required className="bg-light border-0 shadow-sm" />
            </Form.Group>

            <div className="d-flex flex-column gap-3 mt-4 pt-4 border-top">
              <PrimaryButton type="submit" isLoading={loading} disabled={!file || !unidadeDestinoId}>
                {loading ? 'Processando arquivo...' : '📥 Iniciar Sincronização'}
              </PrimaryButton>
              <div className="text-center text-muted fw-bold small my-1">OU</div>
              <PrimaryButton type="button" variant="outline-primary" onClick={() => setShowFormModal(true)}>
                ✏️ Cadastrar Item Manualmente
              </PrimaryButton>
            </div>
          </Form>
        </Card.Body>
      </Card>

      <ModalForm show={showFormModal} onHide={() => setShowFormModal(false)} title="📦 Cadastrar Novo Equipamento">
        <BemForm unidades={unidades} onSubmit={handleManualSubmit} isLoading={isSubmitting} />
      </ModalForm>
    </MainLayout>
  );
}

export default ImportarSipacPage;