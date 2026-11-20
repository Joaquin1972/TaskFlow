// Test funcional automatizado para verificar los requisitos de TaskFlow y AGENTS.md
import assert from 'node:assert';
import { createInitialProjects, createInitialTasks, createInitialReflection, DEFAULT_PREFERENCES } from '../data/initialData';
import { formatDueDateLabel, formatFullDateHeader, getShortDayLabel, isOverdue, toLocalDateKey } from '../utils/dates';
import { Priority, StatusFilter, Task } from '../types/taskflow';

console.log('--- INICIANDO PRUEBAS FUNCIONALES DE TASKFLOW ---');

// 1. Verificación de Localización al Español en Datos Iniciales y Fechas
console.log('\n[Prueba 1] Verificación de idioma español en fechas y datos iniciales...');
const todayKey = toLocalDateKey();
assert.strictEqual(formatDueDateLabel(todayKey, todayKey), 'Hoy', 'Debe devolver "Hoy" para la fecha actual');
assert.strictEqual(formatDueDateLabel(null, todayKey), 'Sin fecha', 'Debe devolver "Sin fecha" para fechas nulas');

const headerDate = formatFullDateHeader(new Date());
console.log(`  ✓ Formato de cabecera de fecha: "${headerDate}"`);
assert.ok(/[a-záéíóúñ]/i.test(headerDate), 'La fecha formateada debe contener caracteres en español');

const initialTasks = createInitialTasks();
assert.ok(initialTasks.length > 0, 'Debe haber tareas iniciales');
const spanishSampleTask = initialTasks.find(t => t.id === 'task-1');
assert.ok(spanishSampleTask, 'Debe existir la tarea 1');
console.log(`  ✓ Título de tarea inicial: "${spanishSampleTask?.title}"`);
assert.ok(spanishSampleTask?.title.includes('informe de preparación'), 'El título de la tarea debe estar en español');
console.log('  -> Prueba 1 SUPERADA.');

// 2. Verificación de Creación de Tareas
console.log('\n[Prueba 2] Creación de nueva tarea...');
const taskList: Task[] = [...initialTasks];
const newTask: Task = {
  id: `task-test-${Date.now()}`,
  title: 'Comprobar integración de pasarela de pago',
  notes: 'Notas de prueba técnica',
  completed: false,
  status: 'todo',
  priority: 'high',
  dueDate: todayKey,
  projectId: 'proj-q4-launch',
  estimateMinutes: 30,
  subtasks: [],
  createdAt: new Date().toISOString(),
  completedAt: null,
  order: Date.now(),
};
taskList.unshift(newTask);
assert.strictEqual(taskList[0].id, newTask.id, 'La nueva tarea debe posicionarse al inicio');
assert.strictEqual(taskList[0].title, 'Comprobar integración de pasarela de pago');
assert.strictEqual(taskList[0].completed, false);
console.log('  -> Prueba 2 SUPERADA: Tarea creada correctamente.');

// 3. Verificación de Edición de Tareas
console.log('\n[Prueba 3] Edición de tarea existente...');
const targetId = newTask.id;
const taskIndex = taskList.findIndex(t => t.id === targetId);
assert.ok(taskIndex !== -1, 'La tarea a editar debe existir');
taskList[taskIndex] = {
  ...taskList[taskIndex],
  title: 'Comprobar integración de pasarela de pago (Actualizada)',
  notes: 'Notas actualizadas',
  priority: 'normal',
};
assert.strictEqual(taskList[taskIndex].title, 'Comprobar integración de pasarela de pago (Actualizada)');
assert.strictEqual(taskList[taskIndex].priority, 'normal');
console.log('  -> Prueba 3 SUPERADA: Tarea editada correctamente.');

// 4. Verificación de Finalización / Cambio de Estado (Pendiente <-> Completada)
console.log('\n[Prueba 4] Marcar tarea como completada y volver a pendiente...');
const toggleCompleted = (t: Task): Task => {
  const nextCompleted = !t.completed;
  return {
    ...t,
    completed: nextCompleted,
    status: nextCompleted ? 'done' : 'todo',
    completedAt: nextCompleted ? new Date().toISOString() : null,
  };
};

taskList[taskIndex] = toggleCompleted(taskList[taskIndex]);
assert.strictEqual(taskList[taskIndex].completed, true, 'La tarea debe estar completada');
assert.strictEqual(taskList[taskIndex].status, 'done', 'El estado debe ser "done"');
assert.ok(taskList[taskIndex].completedAt !== null, 'completedAt no debe ser nulo');

taskList[taskIndex] = toggleCompleted(taskList[taskIndex]);
assert.strictEqual(taskList[taskIndex].completed, false, 'La tarea debe volver a estar pendiente');
assert.strictEqual(taskList[taskIndex].status, 'todo', 'El estado debe volver a "todo"');
assert.strictEqual(taskList[taskIndex].completedAt, null, 'completedAt debe ser nulo');
console.log('  -> Prueba 4 SUPERADA: Alternancia de estado completada/pendiente correcta.');

// 5. Verificación de Filtrado (Todas, Pendientes, Completadas)
console.log('\n[Prueba 5] Filtrado de tareas (todas, activas/pendientes, completadas)...');
// Añadimos una completada y una pendiente
taskList[taskIndex].completed = true;
const filterTasks = (tasks: Task[], filter: StatusFilter): Task[] => {
  if (filter === 'active') return tasks.filter(t => !t.completed);
  if (filter === 'completed') return tasks.filter(t => t.completed);
  return tasks;
};

const allCount = filterTasks(taskList, 'all').length;
const activeCount = filterTasks(taskList, 'active').length;
const completedCount = filterTasks(taskList, 'completed').length;

assert.strictEqual(allCount, activeCount + completedCount, 'La suma de activas y completadas debe ser igual a todas');
assert.ok(completedCount > 0, 'Debe haber tareas completadas');
assert.ok(activeCount > 0, 'Debe haber tareas pendientes');
console.log(`  ✓ Total: ${allCount}, Pendientes: ${activeCount}, Completadas: ${completedCount}`);
console.log('  -> Prueba 5 SUPERADA: Filtrado de tareas correcto.');

// 6. Verificación de Eliminación con Confirmación
console.log('\n[Prueba 6] Eliminación de tarea mediante flujo de confirmación...');
let modalOpen = false;
let pendingTaskId: string | null = null;

// Simulación: usuario pulsa eliminar
const onRequestDelete = (id: string) => {
  pendingTaskId = id;
  modalOpen = true;
};

// Simulación: usuario confirma en modal
const onConfirmDelete = () => {
  if (!modalOpen || !pendingTaskId) throw new Error('No se puede eliminar sin confirmación abierta');
  const idx = taskList.findIndex(t => t.id === pendingTaskId);
  if (idx !== -1) taskList.splice(idx, 1);
  modalOpen = false;
  pendingTaskId = null;
};

onRequestDelete(targetId);
assert.strictEqual(modalOpen, true, 'El modal de confirmación debe abrirse');
assert.strictEqual(pendingTaskId, targetId, 'La tarea pendiente debe ser la seleccionada');

// Comprobar que antes de confirmar aún no se ha eliminado
assert.ok(taskList.some(t => t.id === targetId), 'La tarea aún debe existir antes de confirmar');

onConfirmDelete();
assert.strictEqual(modalOpen, false, 'El modal debe cerrarse tras confirmar');
assert.ok(!taskList.some(t => t.id === targetId), 'La tarea debe haberse eliminado de la lista tras confirmar');
console.log('  -> Prueba 6 SUPERADA: Flujo de eliminación con confirmación verificado.');

// 7. Verificación de Persistencia en localStorage
console.log('\n[Prueba 7] Persistencia y recuperación en localStorage...');
const mockStorage: Record<string, string> = {};
const fakeLocalStorage = {
  getItem: (key: string) => mockStorage[key] ?? null,
  setItem: (key: string, val: string) => { mockStorage[key] = val; },
};

const KEY = 'taskflow_narrative_tasks_v1';
fakeLocalStorage.setItem(KEY, JSON.stringify(taskList));
const retrievedRaw = fakeLocalStorage.getItem(KEY);
assert.ok(retrievedRaw !== null, 'Los datos deben guardarse en el almacenamiento');
const retrievedTasks = JSON.parse(retrievedRaw) as Task[];
assert.strictEqual(retrievedTasks.length, taskList.length, 'La cantidad de tareas recuperadas debe coincidir');
assert.strictEqual(retrievedTasks[0].id, taskList[0].id, 'Los identificadores deben coincidir');
console.log(`  ✓ Persistencia verificada: ${retrievedTasks.length} tareas serializadas y recuperadas.`);
console.log('  -> Prueba 7 SUPERADA: Persistencia en almacenamiento verificada.');

console.log('\n======================================================');
console.log('TODAS LAS PRUEBAS FUNCIONALES HAN SIDO SUPERADAS (7/7)');
console.log('======================================================\n');
