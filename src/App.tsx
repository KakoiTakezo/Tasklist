import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Filter, 
  Search,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Task {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
  priority: 'low' | 'medium' | 'high';
}

type FilterType = 'all' | 'active' | 'completed';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('taskflow_tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  useEffect(() => {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const newTask: Task = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      completed: false,
      createdAt: Date.now(),
      priority,
    };

    setTasks([newTask, ...tasks]);
    setInputValue('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        if (filter === 'active') return !task.completed;
        if (filter === 'completed') return task.completed;
        return true;
      })
      .filter(task => 
        task.text.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [tasks, filter, searchQuery]);

  const stats = {
    total: tasks.length,
    active: tasks.filter(t => !t.completed).length,
    completed: tasks.filter(t => t.completed).length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center space-x-2 mb-2"
          >
            <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle2 className="text-white w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">TaskFlow</h1>
          </motion.div>
          <p className="text-zinc-500 text-sm">Organize your day with precision.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total', value: stats.total, color: 'text-zinc-900' },
            { label: 'Active', value: stats.active, color: 'text-emerald-600' },
            { label: 'Done', value: stats.completed, color: 'text-zinc-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center"
            >
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</span>
              <span className={`text-2xl font-bold ${stat.color}`}>{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 mb-8">
          <form onSubmit={addTask} className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full pl-4 pr-12 py-4 bg-zinc-50 border-none rounded-2xl focus:ring-2 focus:ring-zinc-900 transition-all placeholder:text-zinc-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 px-4 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex space-x-2">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                      priority === p 
                        ? 'bg-zinc-900 text-white' 
                        : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <div className="text-xs text-zinc-400 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </form>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex bg-zinc-100 p-1 rounded-xl w-full sm:w-auto">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
                  filter === f 
                    ? 'bg-white text-zinc-900 shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-700'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-zinc-900 transition-all"
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white border border-zinc-200 rounded-2xl p-4 flex items-center justify-between hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`transition-colors ${task.completed ? 'text-emerald-500' : 'text-zinc-300 hover:text-zinc-400'}`}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium transition-all ${task.completed ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                        {task.text}
                      </span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold tracking-wider ${
                          task.priority === 'high' ? 'text-rose-500' : 
                          task.priority === 'medium' ? 'text-amber-500' : 'text-blue-500'
                        }`}>
                          {task.priority}
                        </span>
                        <span className="text-[10px] text-zinc-400">•</span>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(task.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-zinc-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-100 rounded-full mb-4">
                  <Filter className="text-zinc-300 w-8 h-8" />
                </div>
                <h3 className="text-zinc-900 font-medium">No tasks found</h3>
                <p className="text-zinc-400 text-sm mt-1">Try adjusting your filters or search.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Info */}
        <footer className="mt-12 text-center text-zinc-400 text-xs">
          <p>© {new Date().getFullYear()} TaskFlow • Built with React & Tailwind</p>
        </footer>
      </div>
    </div>
  );
}
