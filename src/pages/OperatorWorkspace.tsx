import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { CheckCircle2, Circle, Clock, Send, Bot, User, Loader2, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

export const OperatorWorkspace: React.FC = () => {
  const { brands, updateBrand } = useAppContext();
  const navigate = useNavigate();
  const currentUser = '张运营'; // Mock current user

  // Filter projects where the current user is an operator
  const myProjects = brands.filter(b => b.operators?.includes(currentUser));

  // Extract all todos and services for the current user
  const myTodos = myProjects.flatMap(project => 
    (project.todos || []).map(todo => ({ ...todo, projectName: project.name, projectId: project.id }))
  );
  
  const myServices = myProjects.flatMap(project => 
    (project.operations?.services || [])
      .filter(s => s.operator === currentUser)
      .map(service => ({ ...service, projectName: project.name, projectId: project.id }))
  );

  const pendingTodos = myTodos.filter(t => !t.completed);
  const completedTodos = myTodos.filter(t => t.completed);

  // Group todos by Project + Brand
  const groupTodos = (todos: typeof pendingTodos) => {
    const grouped: Record<string, typeof pendingTodos> = {};
    todos.forEach(todo => {
      const key = `${todo.projectName}${todo.brandName ? ` - ${todo.brandName}` : ''}`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(todo);
    });
    return grouped;
  };

  const groupedPending = groupTodos(pendingTodos);
  const groupedCompleted = groupTodos(completedTodos);

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
      const contextData = myProjects.map(p => ({
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

    const updatedTodos = project.todos.map(t => 
      t.id === todoId ? { ...t, completed: !currentStatus } : t
    );

    updateBrand(projectId, { todos: updatedTodos });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Tasks & Projects */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6 overflow-y-auto pr-2">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
            我负责的项目 ({myProjects.length})
          </h2>
          <div className="space-y-3">
            {myProjects.map(project => (
              <div key={project.id} className="bg-slate-50 rounded-lg border border-slate-100 overflow-hidden">
                <div 
                  className="p-3 font-medium text-slate-900 cursor-pointer hover:bg-slate-100 transition-colors flex items-center justify-between group"
                  onClick={() => navigate(`/brands/${project.id}`)}
                >
                  <span>{project.name}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                </div>
                {project.brands && project.brands.length > 0 && (
                  <div className="border-t border-slate-100 bg-white">
                    {project.brands.map(brandName => (
                      <div 
                        key={brandName}
                        className="px-4 py-2 text-sm text-slate-600 cursor-pointer hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between border-b border-slate-50 last:border-0 group/brand"
                        onClick={() => navigate(`/brands/${project.id}?brand=${encodeURIComponent(brandName)}`)}
                      >
                        <span>{brandName}</span>
                        <ChevronRight className="w-3 h-3 text-slate-300 group-hover/brand:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {myProjects.length === 0 && (
              <p className="text-sm text-slate-500">暂无负责的项目</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <CheckCircle2 className="w-5 h-5 mr-2 text-indigo-600" />
            我的待办事项
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">待处理 ({pendingTodos.length})</h3>
              {Object.entries(groupedPending).map(([groupName, todos]) => (
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
                          {todo.dueDate && <p className="text-xs text-rose-600 mt-0.5">截止: {todo.dueDate}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {pendingTodos.length === 0 && <p className="text-sm text-slate-400">无待处理事项</p>}
            </div>

            <div>
              <h3 className="text-sm font-medium text-slate-500 mb-3">已完成 ({completedTodos.length})</h3>
              <div className="opacity-70">
                {Object.entries(groupedCompleted).map(([groupName, todos]) => (
                  <div key={groupName} className="mb-4">
                    <h4 className="text-xs font-semibold text-slate-700 mb-2 bg-slate-100 px-2 py-1 rounded inline-block">{groupName}</h4>
                    <ul className="space-y-2">
                      {todos.map(todo => (
                        <li key={todo.id} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <button onClick={() => toggleTodo(todo.projectId, todo.id, todo.completed)} className="mt-0.5 mr-3 text-green-500 hover:text-slate-400">
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                          <div>
                            <p className="text-sm font-medium text-slate-500 line-through">{todo.text}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: AI Assistant */}
      <div className="w-full lg:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
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
  );
};
