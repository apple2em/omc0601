import { useState, useEffect, useRef } from 'react'
import './App.css'

type Filter = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  text: string
  completed: boolean
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
  const [filter, setFilter] = useState<Filter>('all')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  function addTodo() {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [...prev, { id: Date.now(), text, completed: false }])
    setInput('')
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
          <button className="add-btn" onClick={addTodo} aria-label="Add todo">
            Add
          </button>
        </div>

        {todos.length > 0 && (
          <>
            <ul className="todo-list">
              {filtered.map(todo => (
                <li key={todo.id} className={`todo-item${todo.completed ? ' completed' : ''}`}>
                  <input
                    type="checkbox"
                    className="todo-check"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    aria-label={`Mark "${todo.text}" as ${todo.completed ? 'active' : 'complete'}`}
                  />
                  <span className="todo-text">{todo.text}</span>
                  <button
                    className="delete-btn"
                    onClick={() => deleteTodo(todo.id)}
                    aria-label={`Delete "${todo.text}"`}
                  >
                    ×
                  </button>
                </li>
              ))}
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
