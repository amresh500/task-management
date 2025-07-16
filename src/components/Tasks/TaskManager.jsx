// src/components/Tasks/TaskManager.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../App';
import { apiFetch } from '../../api';
import styles from './TaskManager.module.css';

function TaskManager() {
  const { currentUser, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState('list');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [editTask, setEditTask] = useState(null);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchTasks();
    }
  }, [activeTab]);

  const fetchTasks = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch('/api/tasks/list');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      if (data.status) {
        setTasks(data.data || []);
      } else {
        setError(data.message || 'Failed to fetch tasks');
        setTasks([]);
      }
    } catch (err) {
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const formData = new FormData(e.target);

    const createdBy = formData.get('createdBy');

    if (!createdBy) {
      setError('Created By is required.');
      setLoading(false);
      return;
    }

    const payload = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      storyPoint: Number(formData.get('storyPoint')),
      createdBy,
    };

    try {
      const res = await apiFetch('/api/tasks/addTask', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status) {
        setMessage('Task added successfully!');
        e.target.reset();
        setActiveTab('list');
        fetchTasks();
      } else {
        setError(data.message || 'Failed to add task');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const startEditTask = (task) => {
    setEditTask(task);
    setActiveTab('edit');
    setError('');
    setMessage('');
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    const formData = new FormData(e.target);

    const createdBy = formData.get('createdBy');

    if (!createdBy) {
      setError('Created By is required.');
      setLoading(false);
      return;
    }

    const payload = {
      id: editTask.id,
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      storyPoint: Number(formData.get('storyPoint')),
      createdBy,
    };

    try {
      const res = await apiFetch('/api/tasks/update', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status) {
        setMessage('Task updated successfully!');
        setActiveTab('list');
        setEditTask(null);
        fetchTasks();
      } else {
        setError(data.message || 'Failed to update task');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await apiFetch(`/api/tasks/delete/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.status) {
        setMessage('Task deleted successfully!');
        fetchTasks();
      } else {
        setError(data.message || 'Failed to delete task');
      }
    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>Welcome, {currentUser?.Name || currentUser?.name || 'User'}</h2>
        <button type="button" onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <nav className={styles.nav}>
        <button
          type="button"
          className={`${styles.navButton} ${activeTab === 'list' ? styles.active : ''}`}
          onClick={() => setActiveTab('list')}
          disabled={loading}
        >
          View Tasks
        </button>
        <button
          type="button"
          className={`${styles.navButton} ${activeTab === 'add' ? styles.active : ''}`}
          onClick={() => setActiveTab('add')}
          disabled={loading}
        >
          Add Task
        </button>
      </nav>

      <main className={styles.main}>
        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
        {loading && <p className={styles.loading}>Loading...</p>}

        {activeTab === 'list' && !loading && (
          <div className={styles.taskList}>
            {tasks.length === 0 ? (
              <p>No tasks found. Add a new task!</p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className={styles.taskCard}>
                  <h3 className={styles.taskTitle}>{task.name}</h3>
                  <p className={styles.taskDescription}>{task.description}</p>
                  <div className={styles.taskMeta}>
                    <span>Created by: {task.createdBy}</span>
                    <span>Story Points: {task.storyPoint}</span>
                  </div>
                  <div className={styles.taskMeta}>
                    <span>Start: {new Date(task.startDate).toLocaleString()}</span>
                    <span>End: {new Date(task.endDate).toLocaleString()}</span>
                  </div>
                  <div className={styles.taskActions}>
                    <button type="button" onClick={() => startEditTask(task)} disabled={loading}>
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className={styles.deleteButton}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {(activeTab === 'add' || activeTab === 'edit') && (
          <form
            className={styles.form}
            onSubmit={activeTab === 'add' ? handleAddTask : handleUpdateTask}
            noValidate
          >
            <h2>{activeTab === 'add' ? 'Add New Task' : 'Edit Task'}</h2>

            <label htmlFor="name" className={styles.label}>
              Task Name
              <input
                id="name"
                name="name"
                type="text"
                required
                defaultValue={editTask?.name || ''}
                disabled={loading}
                className={styles.input}
              />
            </label>

            <label htmlFor="description" className={styles.label}>
              Description
              <textarea
                id="description"
                name="description"
                required
                defaultValue={editTask?.description || ''}
                disabled={loading}
                className={styles.textarea}
              />
            </label>

            <label htmlFor="startDate" className={styles.label}>
              Start Date
              <input
                id="startDate"
                name="startDate"
                type="datetime-local"
                required
                defaultValue={editTask?.startDate?.slice(0, 16) || ''}
                disabled={loading}
                className={styles.input}
              />
            </label>

            <label htmlFor="endDate" className={styles.label}>
              End Date
              <input
                id="endDate"
                name="endDate"
                type="datetime-local"
                required
                defaultValue={editTask?.endDate?.slice(0, 16) || ''}
                disabled={loading}
                className={styles.input}
              />
            </label>

            <label htmlFor="storyPoint" className={styles.label}>
              Story Points
              <select
                id="storyPoint"
                name="storyPoint"
                required
                defaultValue={editTask?.storyPoint || ''}
                disabled={loading}
                className={styles.select}
              >
                <option value="" disabled>Select Story Points</option>
                <option value="1">1 - Very Easy</option>
                <option value="2">2 - Easy</option>
                <option value="3">3 - Medium</option>
                <option value="5">5 - Hard</option>
                <option value="8">8 - Very Hard</option>
                <option value="13">13 - Extremely Hard</option>
              </select>
            </label>

            <label htmlFor="createdBy" className={styles.label}>
              Created By
              <input
                id="createdBy"
                name="createdBy"
                type="text"
                required
                defaultValue={
                  activeTab === 'add'
                    ? currentUser?.Name || currentUser?.name || ''
                    : editTask?.createdBy || ''
                }
                disabled={loading}
                className={styles.input}
              />
            </label>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton} disabled={loading}>
                {activeTab === 'add' ? 'Add Task' : 'Update Task'}
              </button>
              {activeTab === 'edit' && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    setActiveTab('list');
                    setEditTask(null);
                    setError('');
                    setMessage('');
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

export default TaskManager;
