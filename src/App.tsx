import { useState, useEffect, useRef } from 'react'
import './App.css'

type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  text: string
  completed: boolean
  dueDate?: string // ISO date string YYYY-MM-DD
}

function formatDue(dueDate: string): string {
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  if (dueDate === today) return 'Today'
  if (dueDate === tomorrow) return 'Tomorrow'
  return new Date(dueDate + 'T00:00:00').toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function isOverdue(dueDate: string, completed: boolean): boolean {
  if (completed) return false
  return dueDate < new Date().toISOString().slice(0, 10)
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('todos') ?? '[]')
    } catch {
      return []
    }
  })
  const [input, setInput] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  function addTodo() {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [
      ...prev,
      { id: Date.now(), text, completed: false, dueDate: dueDate || undefined },
    ])
    setInput('')
    setDueDate('')
    inputRef.current?.focus()
  }

  function toggleTodo(id: number) {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }

  function deleteTodo(id: number) {
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  function clearCompleted() {
    setTodos(prev => prev.filter(t => !t.completed))
  }

  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const activeCount = todos.filter(t => !t.completed).length
  const hasCompleted = todos.some(t => t.completed)
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="app">
      <h1>todos</h1>

      <div className="card">
        <div className="input-row">
          <input
            ref={inputRef}
            className="todo-input"
            type="text"
            placeholder="What needs to be done?"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTodo()}
            autoFocus
          />
          <input
            className="date-input"
            type="date"
            value={dueDate}
            min={today}
            onChange={e => setDueDate(e.target.value)}
            aria-label="Due date"
          />
          <button className="add-btn" onClick={addTodo} aria-label="Add todo">
            Add
          </button>
        </div>

        {todos.length > 0 && (
          <>
            <ul className="todo-list">
              {filtered.map(todo => {
                const overdue = todo.dueDate ? isOverdue(todo.dueDate, todo.completed) : false
                return (
                  <li
                    key={todo.id}
                    className={[
                      'todo-item',
                      todo.completed ? 'completed' : '',
                      overdue ? 'overdue' : '',
                    ].filter(Boolean).join(' ')}
                  >
                    <input
                      type="checkbox"
                      className="todo-check"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'complete'}`}
                    />
                    <span className="todo-body">
                      <span className="todo-text">{todo.text}</span>
                      {todo.dueDate && (
                        <span className={`due-badge${overdue ? ' overdue' : ''}`}>
                          {overdue ? '⚠ ' : ''}{formatDue(todo.dueDate)}
                        </span>
                      )}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTodo(todo.id)}
                      aria-label={`Delete "${todo.text}"`}
                    >
                      ×
                    </button>
                  </li>
                )
              })}
            </ul>

            <div className="footer">
              <span className="count">
                {activeCount} {activeCount === 1 ? 'item' : 'items'} left
              </span>

              <div className="filters" role="group" aria-label="Filter todos">
                {(['all', 'active', 'completed'] as Filter[]).map(f => (
                  <button
                    key={f}
                    className={`filter-btn${filter === f ? ' active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f[0].toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>

              {hasCompleted && (
                <button className="clear-btn" onClick={clearCompleted}>
                  Clear completed
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
