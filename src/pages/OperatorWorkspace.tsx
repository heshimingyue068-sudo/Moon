import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { CheckCircle2, Circle, Clock, Send, Bot, User, Loader2, Briefcase, FileText, ChevronRight, Plus, Bell, X, Calendar, CheckSquare, Download } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { BrandTodo } from '../types';

export const OperatorWorkspace: React.FC = () => {
  const { brands, updateBrand } = useAppContext();
  const navigate = useNavigate();
  const [role, setRole] = useState<'OPERATOR' | 'MANAGER'>('OPERATOR');
  const currentUser = role === 'MANAGER' ? '王经理' : '张运营'; // Mock current user based on role

  const [activeModal, setActiveModal] = useState<'TODAY' | 'PENDING' | 'COMPLETED' | 'PROJECTS' | 'NEW_TODO' | 'SEND_NOTIFY' | null>(null);
  const [todoTab, setTodoTab] = useState<'MY' | 'TEAM'>('MY');

  // Filter projects based on role
  const displayProjects = role === 'MANAGER' ? brands : brands.filter(b => b.operators?.includes(currentUser));

  // Extract all todos
  const displayTodos = displayProjects.flatMap(project => 
    (project.todos || []).map(todo => ({ ...todo, projectName: project.name, projectId: project.id }))
  );
  
  const pendingTodos = displayTodos.filter(t => !t.completed);
  const completedTodos = displayTodos.filter(t => t.completed);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayTodos = pendingTodos.filter(t => t.dueDate === todayStr);

  // Group todos
  const groupTodos = (todos: typeof pendingTodos) => {
    const grouped: Record<string, typeof pendingTodos> = {};
    todos.forEach(todo => {
      const key = `${todo.projectName}${todo.brandName ? ` - ${todo.brandName}` : ''}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(todo);
    });
    return grouped;
  };

  const myPendingTodos = role === 'MANAGER' ? pendingTodos.filter(t => t.operator === currentUser) : pendingTodos;
  const teamPendingTodos = role === 'MANAGER' ? pendingTodos.filter(t => t.operator !== currentUser) : [];

  const groupedMyPending = groupTodos(myPendingTodos);
  
  // For team todos, group by operator
  const groupTeamTodos = (todos: typeof pendingTodos) => {
    const grouped: Record<string, typeof pendingTodos> = {};
    todos.forEach(todo => {
      const key = `负责人: ${todo.operator || '未分配'}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(todo);
    });
    return grouped;
  };
  const groupedTeamPending = role === 'MANAGER' ? groupTeamTodos(teamPendingTodos) : {};

  const groupedCompleted = groupTodos(completedTodos);

  // New Todo State
  const [newTodo, setNewTodo] = useState({ projectId: '', brandName: '', text: '', dueDate: '', cc: '' });
  
  // Notify State
  const [notifyState, setNotifyState] = useState({ todoId: '', cc: '' });

  // AI Chat State
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { role: 'assistant', content: `你好，${currentUser}！我是你的专属AI运营助手。我已经读取了你负责的项目资料，有什么可以帮你的吗？` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Prepare context from user's projects
      const contextData = displayProjects.map(p => ({
        projectName: p.name,
        brands: p.brands,
        phase: p.currentPhase,
        todos: p.todos,
        activities: p.operations?.activities,
        assets: p.assets
      }));

      const systemInstruction = `你是一个专业的项目运营AI助手。当前用户是：${currentUser}。
      用户负责的项目数据如下：${JSON.stringify(contextData)}。
      请根据这些资料，回答用户的问题，提供运营建议，或者帮助分析周报/月报数据。回答要专业、简洁。`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || '抱歉，我没有理解你的问题。' }]);
    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，AI助手暂时无法响应，请稍后再试。' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTodo = (projectId: string, todoId: string, currentStatus: boolean) => {
    const project = brands.find(b => b.id === projectId);
    if (!project || !project.todos) return;

    const now = new Date();
    const completedAtStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updatedTodos = project.todos.map(t => 
      t.id === todoId ? { ...t, completed: !currentStatus, completedAt: !currentStatus ? completedAtStr : undefined } : t
    );

    updateBrand(projectId, { todos: updatedTodos });
  };

  const handleAddTodo = () => {
    if (!newTodo.projectId || !newTodo.text) return;
    const project = brands.find(b => b.id === newTodo.projectId);
    if (!project) return;

    const todo: BrandTodo = {
      id: `t${Date.now()}`,
      text: newTodo.text,
      completed: false,
      dueDate: newTodo.dueDate,
      brandName: newTodo.brandName,
      cc: newTodo.cc ? newTodo.cc.split(',').map(s => s.trim()) : [],
    };

    updateBrand(project.id, { todos: [...(project.todos || []), todo] });
    setActiveModal(null);
    setNewTodo({ projectId: '', brandName: '', text: '', dueDate: '', cc: '' });
  };

  const handleSendNotify = () => {
    if (!notifyState.todoId || !notifyState.cc) return;
    alert(`通知已发送给: ${notifyState.cc}`);
    setActiveModal(null);
    setNotifyState({ todoId: '', cc: '' });
  };

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-8rem)]">
      {/* Top Bar: Role Switcher & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-slate-900">工作台</h1>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setRole('OPERATOR')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${role === 'OPERATOR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              运营人员
            </button>
            <button
              onClick={() => setRole('MANAGER')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${role === 'MANAGER' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
            >
              运营主管
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveModal('NEW_TODO')}
            className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-inset ring-indigo-300 hover:bg-indigo-100"
          >
            <Plus className="mr-2 h-4 w-4" />
            新建待办
          </button>
          <button 
            onClick={() => setActiveModal('SEND_NOTIFY')}
            className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
          >
            <Bell className="mr-2 h-4 w-4" />
            发送通知
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div onClick={() => setActiveModal('TODAY')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">今日待办</h3>
            <Calendar className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{todayTodos.length}</p>
        </div>
        <div onClick={() => setActiveModal('PENDING')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">待办事项</h3>
            <Clock className="h-5 w-5 text-rose-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{pendingTodos.length}</p>
        </div>
        <div onClick={() => setActiveModal('COMPLETED')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-green-300 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">已完成</h3>
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{completedTodos.length}</p>
        </div>
        <div onClick={() => setActiveModal('PROJECTS')} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 cursor-pointer hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-slate-500">{role === 'MANAGER' ? '所有项目' : '我的项目'}</h3>
            <Briefcase className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{displayProjects.length}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        {/* Left Panel: Tasks & Projects */}
        <div className="w-full lg:w-7/12 flex flex-col gap-6 overflow-y-auto pr-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 min-h-0 overflow-y-auto">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600" />
              待办事项
            </h2>
            
            <div className="space-y-6">
              {role === 'MANAGER' && (
                <div className="flex border-b border-slate-200 mb-4">
                  <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${todoTab === 'MY' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setTodoTab('MY')}
                  >
                    我的待办 ({myPendingTodos.length})
                  </button>
                  <button
                    className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${todoTab === 'TEAM' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    onClick={() => setTodoTab('TEAM')}
                  >
                    团队待办 ({teamPendingTodos.length})
                  </button>
                </div>
              )}

              {/* My Todos */}
              {(role === 'OPERATOR' || todoTab === 'MY') && (
                <div>
                  {role === 'OPERATOR' && (
                    <h3 className="text-sm font-medium text-slate-500 mb-3">
                      待处理 ({pendingTodos.length})
                    </h3>
                  )}
                  {Object.entries(groupedMyPending).map(([groupName, todos]) => (
                    <div key={groupName} className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 bg-slate-100 px-2 py-1 rounded inline-block">{groupName}</h4>
                      <ul className="space-y-2">
                        {todos.map(todo => (
                          <li key={todo.id} className="flex items-start p-3 bg-rose-50 rounded-lg border border-rose-100">
                            <button onClick={() => toggleTodo(todo.projectId, todo.id, todo.completed)} className="mt-0.5 mr-3 text-slate-400 hover:text-indigo-600">
                              <Circle className="w-5 h-5" />
                            </button>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{todo.text}</p>
                              {role === 'MANAGER' && <p className="text-xs text-slate-500 mt-0.5">项目: {todo.projectName}</p>}
                              {todo.dueDate && <p className="text-xs text-rose-600 mt-0.5">截止: {todo.dueDate}</p>}
                              {todo.cc && todo.cc.length > 0 && <p className="text-xs text-slate-500 mt-0.5">抄送: {todo.cc.join(', ')}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {myPendingTodos.length === 0 && <p className="text-sm text-slate-400">无待处理事项</p>}
                </div>
              )}

              {/* Team Todos (Manager Only) */}
              {role === 'MANAGER' && todoTab === 'TEAM' && (
                <div>
                  {Object.entries(groupedTeamPending).map(([groupName, todos]) => (
                    <div key={groupName} className="mb-4">
                      <h4 className="text-xs font-semibold text-slate-700 mb-2 bg-slate-100 px-2 py-1 rounded inline-block">{groupName}</h4>
                      <ul className="space-y-2">
                        {todos.map(todo => (
                          <li key={todo.id} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <button onClick={() => toggleTodo(todo.projectId, todo.id, todo.completed)} className="mt-0.5 mr-3 text-slate-400 hover:text-indigo-600">
                              <Circle className="w-5 h-5" />
                            </button>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{todo.text}</p>
                              <p className="text-xs text-slate-500 mt-0.5">项目: {todo.projectName} {todo.brandName ? `- ${todo.brandName}` : ''}</p>
                              {todo.dueDate && <p className="text-xs text-rose-600 mt-0.5">截止: {todo.dueDate}</p>}
                              {todo.cc && todo.cc.length > 0 && <p className="text-xs text-slate-500 mt-0.5">抄送: {todo.cc.join(', ')}</p>}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {teamPendingTodos.length === 0 && <p className="text-sm text-slate-400">无团队待办事项</p>}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center shrink-0">
              <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
              {role === 'MANAGER' ? '所有项目' : '我负责的项目'} ({displayProjects.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {displayProjects.map(project => (
                <div key={project.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div 
                    className="p-4 cursor-pointer hover:bg-slate-100 transition-colors flex-1"
                    onClick={() => navigate(`/brands/${project.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-slate-900 truncate pr-2">{project.name}</h3>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        project.healthStatus === 'HEALTHY' ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' :
                        project.healthStatus === 'AT_RISK' ? 'bg-yellow-50 text-yellow-800 ring-1 ring-inset ring-yellow-600/20' :
                        'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
                      }`}>
                        {project.healthStatus === 'HEALTHY' ? '健康' : project.healthStatus === 'AT_RISK' ? '存在风险' : '需要关注'}
                      </span>
                      <span className="text-xs text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                        {project.currentPhase === 'ONBOARDING' ? '接入与上架' :
                         project.currentPhase === 'OPERATING' ? '运营监控' : '复盘与续约'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>负责人: {project.manager}</span>
                      <span>待办: {project.todos?.filter(t => !t.completed).length || 0}</span>
                    </div>
                  </div>
                  {project.brands && project.brands.length > 0 && (
                    <div className="border-t border-slate-200 bg-white px-4 py-2 flex flex-wrap gap-1.5">
                      {project.brands.map(brandName => (
                        <span 
                          key={brandName}
                          className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10 cursor-pointer hover:bg-indigo-100 transition-colors"
                          onClick={(e) => { e.stopPropagation(); navigate(`/brands/${project.id}?brand=${encodeURIComponent(brandName)}`); }}
                        >
                          {brandName}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {displayProjects.length === 0 && (
                <div className="col-span-full p-8 text-center text-slate-500 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                  暂无项目
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel: AI Assistant */}
        <div className="w-full lg:w-5/12 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden min-h-0">
        <div className="p-4 border-b border-slate-100 bg-indigo-50/50 flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
            <Bot className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">个人 AI 助手</h2>
            <p className="text-xs text-slate-500">基于您的项目资料库和活动数据提供分析与建议</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 ml-3' : 'bg-white border border-slate-200 mr-3'}`}>
                  {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-indigo-600" />}
                </div>
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'}`}>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex flex-row max-w-[80%]">
                <div className="w-8 h-8 rounded-full bg-white border border-slate-200 mr-3 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm flex items-center">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600 mr-2" />
                  <span className="text-sm text-slate-500">AI 正在思考...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="询问项目进展、分析活动数据、或要求生成周报..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 placeholder-slate-400 py-2"
            />
            <button
              onClick={handleSendMessage}
              disabled={!input.trim() || isLoading}
              className="ml-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      </div>

      {/* Modals */}
      {activeModal === 'NEW_TODO' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">新建待办</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">所属项目</label>
                <select 
                  value={newTodo.projectId} 
                  onChange={(e) => setNewTodo({...newTodo, projectId: e.target.value, brandName: ''})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">选择项目...</option>
                  {displayProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {newTodo.projectId && brands.find(b => b.id === newTodo.projectId)?.brands?.length ? (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">所属子品牌 (可选)</label>
                  <select 
                    value={newTodo.brandName} 
                    onChange={(e) => setNewTodo({...newTodo, brandName: e.target.value})}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">选择子品牌...</option>
                    {brands.find(b => b.id === newTodo.projectId)?.brands?.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">待办内容</label>
                <input 
                  type="text" 
                  value={newTodo.text} 
                  onChange={(e) => setNewTodo({...newTodo, text: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="输入待办事项内容"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">截止日期</label>
                <input 
                  type="date" 
                  value={newTodo.dueDate} 
                  onChange={(e) => setNewTodo({...newTodo, dueDate: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">抄送人 (逗号分隔)</label>
                <input 
                  type="text" 
                  value={newTodo.cc} 
                  onChange={(e) => setNewTodo({...newTodo, cc: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例如：张三, 李四"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">取消</button>
              <button onClick={handleAddTodo} disabled={!newTodo.projectId || !newTodo.text} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">确定</button>
            </div>
          </div>
        </div>
      )}

      {activeModal === 'SEND_NOTIFY' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">发送通知</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">选择待办事项</label>
                <select 
                  value={notifyState.todoId} 
                  onChange={(e) => setNotifyState({...notifyState, todoId: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">请选择...</option>
                  {pendingTodos.map(t => <option key={t.id} value={t.id}>{t.text} ({t.projectName})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">抄送人 (逗号分隔)</label>
                <input 
                  type="text" 
                  value={notifyState.cc} 
                  onChange={(e) => setNotifyState({...notifyState, cc: e.target.value})}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="例如：王五, 赵六"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button onClick={() => setActiveModal(null)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md shadow-sm hover:bg-slate-50">取消</button>
              <button onClick={handleSendNotify} disabled={!notifyState.todoId || !notifyState.cc} className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">发送</button>
            </div>
          </div>
        </div>
      )}

      {['TODAY', 'PENDING', 'COMPLETED', 'PROJECTS'].includes(activeModal || '') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">
                {activeModal === 'TODAY' && '今日待办'}
                {activeModal === 'PENDING' && '待办事项'}
                {activeModal === 'COMPLETED' && '已完成'}
                {activeModal === 'PROJECTS' && '项目列表'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-500">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              {activeModal === 'TODAY' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-sm text-slate-500">
                        <th className="pb-3 font-medium">时间</th>
                        <th className="pb-3 font-medium">任务</th>
                        <th className="pb-3 font-medium text-right">操作</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {todayTodos.map(todo => (
                        <tr key={todo.id} className="hover:bg-slate-50">
                          <td className="py-3 text-sm text-slate-600">{todo.dueDate}</td>
                          <td className="py-3">
                            <p className="text-sm font-medium text-slate-900">{todo.text}</p>
                            <p className="text-xs text-slate-500">{todo.projectName} {todo.brandName ? `- ${todo.brandName}` : ''}</p>
                          </td>
                          <td className="py-3 text-right">
                            <button className="text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                              上传资料
                            </button>
                          </td>
                        </tr>
                      ))}
                      {todayTodos.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-slate-500 text-sm">暂无数据</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              {activeModal === 'PENDING' && (
                <div className="space-y-6">
                  {role === 'MANAGER' && (
                    <div className="flex border-b border-slate-200 mb-4">
                      <button
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${todoTab === 'MY' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setTodoTab('MY')}
                      >
                        我的待办 ({myPendingTodos.length})
                      </button>
                      <button
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${todoTab === 'TEAM' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                        onClick={() => setTodoTab('TEAM')}
                      >
                        团队待办 ({teamPendingTodos.length})
                      </button>
                    </div>
                  )}

                  {/* My Todos */}
                  {(role === 'OPERATOR' || todoTab === 'MY') && (
                    <div>
                      {role === 'OPERATOR' && (
                        <h4 className="text-sm font-medium text-slate-500 mb-3">
                          待处理 ({pendingTodos.length})
                        </h4>
                      )}
                      <ul className="space-y-3">
                        {myPendingTodos.map(todo => (
                          <li key={todo.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-900">{todo.text}</p>
                            <p className="text-xs text-slate-500 mt-1">{todo.projectName} {todo.brandName ? `- ${todo.brandName}` : ''}</p>
                            {todo.dueDate && <p className="text-xs text-rose-600 mt-1">截止: {todo.dueDate}</p>}
                          </li>
                        ))}
                        {myPendingTodos.length === 0 && <p className="text-slate-500 text-sm">暂无数据</p>}
                      </ul>
                    </div>
                  )}

                  {/* Team Todos (Manager Only) */}
                  {role === 'MANAGER' && todoTab === 'TEAM' && (
                    <div>
                      <ul className="space-y-3">
                        {teamPendingTodos.map(todo => (
                          <li key={todo.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-900">{todo.text}</p>
                            <p className="text-xs text-slate-500 mt-1">
                              项目: {todo.projectName} {todo.brandName ? `- ${todo.brandName}` : ''} | 负责人: {todo.operator || '未分配'}
                            </p>
                            {todo.dueDate && <p className="text-xs text-rose-600 mt-1">截止: {todo.dueDate}</p>}
                          </li>
                        ))}
                        {teamPendingTodos.length === 0 && <p className="text-slate-500 text-sm">暂无数据</p>}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {activeModal === 'COMPLETED' && (
                <ul className="space-y-3">
                  {completedTodos.map(todo => (
                    <li key={todo.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 opacity-70 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-slate-900 line-through">{todo.text}</p>
                        <p className="text-xs text-slate-500 mt-1">{todo.projectName} {todo.brandName ? `- ${todo.brandName}` : ''}</p>
                        {todo.completedAt && <p className="text-xs text-green-600 mt-1">完成时间: {todo.completedAt}</p>}
                      </div>
                      {todo.materialName && (
                        <button className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-md transition-colors">
                          <Download className="w-3 h-3" />
                          {todo.materialName}
                        </button>
                      )}
                    </li>
                  ))}
                  {completedTodos.length === 0 && <p className="text-slate-500 text-sm">暂无数据</p>}
                </ul>
              )}
              {activeModal === 'PROJECTS' && (
                <ul className="space-y-3">
                  {displayProjects.map(project => (
                    <li key={project.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center cursor-pointer hover:bg-slate-100" onClick={() => { setActiveModal(null); navigate(`/brands/${project.id}`); }}>
                      <span className="text-sm font-medium text-slate-900">{project.name}</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </li>
                  ))}
                  {displayProjects.length === 0 && <p className="text-slate-500 text-sm">暂无数据</p>}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
