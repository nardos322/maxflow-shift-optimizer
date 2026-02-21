import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { GitBranch, ShieldCheck, Sparkles, AlertTriangle, Workflow } from 'lucide-react';
import { asignacionesService } from '@/services/asignaciones.service';
import { medicosService } from '@/services/medicos.service';
import type { PlanVersionSummary, ReparacionResult } from '@/types/asignaciones';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function fmtDate(value?: string) {
  if (!value) return 'N/A';
  return new Date(value).toLocaleString();
}

function estadoBadgeVariant(estado?: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (estado === 'PUBLICADO') return 'default';
  if (estado === 'DRAFT') return 'secondary';
  return 'outline';
}

export function SolverVersionsPage() {
  const queryClient = useQueryClient();
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [repairMedicoId, setRepairMedicoId] = useState('');
  const [ventanaInicio, setVentanaInicio] = useState('');
  const [ventanaFin, setVentanaFin] = useState('');
  const [darDeBaja, setDarDeBaja] = useState(false);
  const [previewResult, setPreviewResult] = useState<ReparacionResult | null>(null);

  const { data: versiones = [], isLoading: loadingVersiones } = useQuery({
    queryKey: ['plan-versiones'],
    queryFn: () => asignacionesService.getVersiones(),
  });

  const { data: medicos = [] } = useQuery({
    queryKey: ['medicos', 'activos', 'versiones'],
    queryFn: () => medicosService.getAll(true),
  });

  useEffect(() => {
    if (versiones.length > 0 && selectedVersionId == null) {
      setSelectedVersionId(versiones[0].id);
    }
  }, [versiones, selectedVersionId]);

  const selectedVersion = useMemo(
    () => versiones.find((v) => v.id === selectedVersionId) ?? null,
    [versiones, selectedVersionId]
  );

  const { data: riesgo } = useQuery({
    queryKey: ['plan-riesgo', selectedVersionId],
    queryFn: () => asignacionesService.getRiesgoVersion(selectedVersionId as number),
    enabled: selectedVersionId != null,
  });

  const { data: aprobacion } = useQuery({
    queryKey: ['plan-aprobacion', selectedVersionId],
    queryFn: () => asignacionesService.getAprobacionVersion(selectedVersionId as number),
    enabled: selectedVersionId != null,
  });

  const { data: autofix } = useQuery({
    queryKey: ['plan-autofix', selectedVersionId],
    queryFn: () => asignacionesService.getAutofixVersion(selectedVersionId as number),
    enabled: selectedVersionId != null,
  });

  const { data: diffPublicado } = useQuery({
    queryKey: ['plan-diff-publicado', selectedVersionId],
    queryFn: () => asignacionesService.getDiffPublicado(selectedVersionId as number),
    enabled: selectedVersionId != null,
    retry: false,
  });

  const publicarMutation = useMutation({
    mutationFn: (versionId: number) => asignacionesService.publicarVersion(versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plan-versiones'] });
      queryClient.invalidateQueries({ queryKey: ['plan-riesgo'] });
      queryClient.invalidateQueries({ queryKey: ['plan-aprobacion'] });
      queryClient.invalidateQueries({ queryKey: ['plan-diff-publicado'] });
      queryClient.invalidateQueries({ queryKey: ['asignaciones'] });
    },
  });

  const previewMutation = useMutation({
    mutationFn: () =>
      asignacionesService.previsualizarReparacion({
        medicoId: Number(repairMedicoId),
        darDeBaja,
        ventanaInicio: ventanaInicio || undefined,
        ventanaFin: ventanaFin || undefined,
      }),
    onSuccess: (data) => setPreviewResult(data),
  });

  const candidateMutation = useMutation({
    mutationFn: () =>
      asignacionesService.crearReparacionCandidata({
        medicoId: Number(repairMedicoId),
        darDeBaja,
        ventanaInicio: ventanaInicio || undefined,
        ventanaFin: ventanaFin || undefined,
      }),
    onSuccess: (data) => {
      setPreviewResult(data);
      queryClient.invalidateQueries({ queryKey: ['plan-versiones'] });
      if (data.planVersion?.id) {
        setSelectedVersionId(data.planVersion.id);
      }
    },
  });

  const publishedCount = versiones.filter((v) => v.estado === 'PUBLICADO').length;
  const draftCount = versiones.filter((v) => v.estado === 'DRAFT').length;

  return (
    <div className="space-y-6">
      <section className="panel-glass dash-reveal rounded-2xl border border-border/70 p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <h2 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight md:text-4xl">
              <GitBranch className="h-8 w-8 text-primary" />
              Versionado y Aprobación
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
              Revisa riesgo, decisión de aprobación y autofix antes de publicar cambios del planificador anual.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="panel-glass rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Versiones</p>
          <p className="mt-2 text-3xl font-extrabold">{versiones.length}</p>
        </div>
        <div className="panel-glass rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Publicadas</p>
          <p className="mt-2 text-3xl font-extrabold text-primary">{publishedCount}</p>
        </div>
        <div className="panel-glass rounded-xl border border-border/70 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Borradores</p>
          <p className="mt-2 text-3xl font-extrabold">{draftCount}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr]">
        <section className="panel-glass rounded-xl border border-border/70">
          <div className="border-b border-border/70 p-5">
            <h3 className="text-xl font-bold">Versiones de Plan</h3>
          </div>
          <div className="p-5">
            {loadingVersiones ? (
              <div className="text-sm text-muted-foreground">Cargando versiones...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versiones.map((v: PlanVersionSummary) => (
                    <TableRow
                      key={v.id}
                      className={`cursor-pointer ${selectedVersionId === v.id ? 'bg-accent/40' : ''}`}
                      onClick={() => setSelectedVersionId(v.id)}
                    >
                      <TableCell className="font-semibold">#{v.id}</TableCell>
                      <TableCell>{v.tipo}</TableCell>
                      <TableCell>
                        <Badge variant={estadoBadgeVariant(v.estado)}>{v.estado}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{fmtDate(v.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="panel-glass rounded-xl border border-border/70 p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold">Decisión de Aprobación</h3>
              {selectedVersion && (
                <Button
                  size="sm"
                  onClick={() => publicarMutation.mutate(selectedVersion.id)}
                  disabled={
                    publicarMutation.isPending ||
                    !aprobacion?.decision?.aprobable ||
                    selectedVersion.estado === 'PUBLICADO'
                  }
                >
                  {publicarMutation.isPending ? 'Publicando...' : 'Publicar Versión'}
                </Button>
              )}
            </div>
            {!selectedVersion && <p className="mt-3 text-sm text-muted-foreground">Selecciona una versión.</p>}
            {selectedVersion && aprobacion && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant={aprobacion.decision.aprobable ? 'default' : 'destructive'}>
                    {aprobacion.decision.recomendacion}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Bloqueantes: {aprobacion.decision.bloqueantes.length} · Advertencias: {aprobacion.decision.advertencias.length}
                  </span>
                </div>
                {aprobacion.decision.bloqueantes.length > 0 && (
                  <ul className="space-y-1 text-sm text-destructive">
                    {aprobacion.decision.bloqueantes.map((b) => (
                      <li key={b} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="panel-glass rounded-xl border border-border/70 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <ShieldCheck className="h-4 w-4" /> Riesgo Operativo
            </h3>
            {riesgo ? (
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p>Cambios netos: <strong>{riesgo.resumen.cambiosNetos}</strong></p>
                <p>Días riesgo cobertura: <strong>{riesgo.resumen.diasConRiesgoCobertura}</strong></p>
                <p>Médicos afectados: <strong>{riesgo.resumen.medicosAfectados}</strong></p>
                <p>Cambios zona congelada: <strong>{riesgo.resumen.cambiosEnZonaCongelada}</strong></p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sin datos de riesgo.</p>
            )}
          </div>

          <div className="panel-glass rounded-xl border border-border/70 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Sparkles className="h-4 w-4" /> Autofix Sugerido
            </h3>
            {autofix ? (
              <div className="mt-3 space-y-2 text-sm">
                <p>Inicio sugerido: <strong>{fmtDate(autofix.parametrosReintento.ventanaInicioSugerida)}</strong></p>
                <p>Fin sugerido: <strong>{fmtDate(autofix.parametrosReintento.ventanaFinSugerida ?? undefined)}</strong></p>
                <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                  {autofix.pasosSugeridos.map((paso) => (
                    <li key={paso}>{paso}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">Sin sugerencias disponibles.</p>
            )}
          </div>

          <div className="panel-glass rounded-xl border border-border/70 p-5">
            <h3 className="flex items-center gap-2 text-lg font-bold">
              <Workflow className="h-4 w-4" /> Diff vs Publicada
            </h3>
            {diffPublicado ? (
              <div className="mt-3 grid gap-2 text-sm md:grid-cols-3">
                <p>Agregadas: <strong>{diffPublicado.resumen.agregadas}</strong></p>
                <p>Removidas: <strong>{diffPublicado.resumen.removidas}</strong></p>
                <p>Neto: <strong>{diffPublicado.resumen.cambiosNetos}</strong></p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">No hay comparación disponible con versión publicada.</p>
            )}
          </div>
        </section>
      </div>

      <section className="panel-glass rounded-xl border border-border/70 p-5">
        <h3 className="text-lg font-bold">Crear Candidata de Reparación</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Médico</Label>
            <Select value={repairMedicoId} onValueChange={setRepairMedicoId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona médico" />
              </SelectTrigger>
              <SelectContent>
                {medicos.map((m) => (
                  <SelectItem key={m.id} value={String(m.id)}>{m.nombre}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Ventana Inicio</Label>
            <Input type="date" value={ventanaInicio} onChange={(e) => setVentanaInicio(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Ventana Fin</Label>
            <Input type="date" value={ventanaFin} onChange={(e) => setVentanaFin(e.target.value)} />
          </div>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input type="checkbox" checked={darDeBaja} onChange={(e) => setDarDeBaja(e.target.checked)} />
            Dar de baja al médico
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => previewMutation.mutate()}
            disabled={!repairMedicoId || previewMutation.isPending}
          >
            {previewMutation.isPending ? 'Previsualizando...' : 'Previsualizar'}
          </Button>
          <Button
            onClick={() => candidateMutation.mutate()}
            disabled={!repairMedicoId || candidateMutation.isPending}
          >
            {candidateMutation.isPending ? 'Creando...' : 'Crear Candidata'}
          </Button>
        </div>

        {previewResult && (
          <div className="mt-4 rounded-lg border border-border/70 bg-background/60 p-4 text-sm">
            <p className="font-semibold">Resultado: {previewResult.status}</p>
            {previewResult.resumenImpacto && (
              <p className="mt-1 text-muted-foreground">
                Cambios estimados: {previewResult.resumenImpacto.cambiosEstimados} · Días afectados: {previewResult.resumenImpacto.diasAfectados}
              </p>
            )}
            {previewResult.planVersion?.id && (
              <p className="mt-1 text-primary">Versión candidata creada: #{previewResult.planVersion.id}</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
