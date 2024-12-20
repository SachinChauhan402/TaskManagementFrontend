import React, { useEffect, useState } from 'react';
import { deleteTask, fetchTasks, createTask } from '../utils/api';
import { Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement } from 'chart.js';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Register necessary components
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  PointElement,  // Needed for line chart points
  LineElement    // Needed for line chart
);

const TaskList = ({ setTasks }) => {
  const [tasks, setLocalTasks] = useState([]);
  const [sortBy, setSortBy] = useState('dueDate');
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    const getTasks = async () => {
      try {
        const fetchedTasks = await fetchTasks();
        setLocalTasks(fetchedTasks);
        setTasks(fetchedTasks);
        setCompletedTasks(fetchedTasks.filter(task => task.completed));
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    getTasks();
  }, [setTasks]);

  const handleDelete = async (id) => {
    try {
      await deleteTask(id);
      setLocalTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updatedTask = await createTask(form); 
      setLocalTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === updatedTask._id ? updatedTask : task
        )
      );
      setEditingTask(null);
      setForm({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSortByDueDate = () => {
    setSortBy('dueDate');
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    setLocalTasks(sortedTasks);
  };

  const handleSortByPriority = () => {
    setSortBy('priority');
    const priorities = { High: 1, Medium: 2, Low: 3 };
    const sortedTasks = [...tasks].sort((a, b) => priorities[a.priority] - priorities[b.priority]);
    setLocalTasks(sortedTasks);
  };

  const handleViewDetails = (task) => {
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  const taskDistributionData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [
          tasks.filter(task => task.priority === 'High').length,
          tasks.filter(task => task.priority === 'Medium').length,
          tasks.filter(task => task.priority === 'Low').length,
        ],
        backgroundColor: ['#FF5733', '#FFBD33', '#33FF57'],
        hoverBackgroundColor: ['#FF5733', '#FFBD33', '#33FF57'],
      },
    ],
  };

  const completionRateData = {
    labels: tasks.map(task => new Date(task.dueDate).toLocaleDateString()),
    datasets: [
      {
        label: 'Completed Tasks',
        data: tasks.map((task) => (task.completed ? 1 : 0)),
        fill: false,
        borderColor: 'green',
        tension: 0.1,
      },
    ],
  };

  const upcomingTasks = tasks.filter((task) => new Date(task.dueDate) > new Date());

  return (
    <div style={{ display: 'flex', gap: '20px' }}>
      <div style={{ flex: '1', padding: '20px' }}>
        <h2>Analytical Dashboard</h2>
        
        <div style={{ marginBottom: '30px' }}>
          <h3>Task Distribution</h3>
          <Pie data={taskDistributionData} />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <h3>Completion Rate</h3>
          <Line data={completionRateData} />
        </div>

        <div>
          <h3>Upcoming Deadlines</h3>
          <ul>
            {upcomingTasks.length === 0 ? (
              <p>No upcoming tasks</p>
            ) : (
              upcomingTasks.map((task) => (
                <li key={task._id}>
                  <p>{task.title}</p>
                  <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div style={{ flex: '2', padding: '20px', width: '60%' }}>
        <div>
          <button onClick={handleSortByDueDate}>Sort by Due Date</button>
          <button onClick={handleSortByPriority}>Sort by Priority</button>
        </div>

        {editingTask && (
          <form onSubmit={handleUpdate} style={{ marginTop: '20px' }}>
            <h2>Edit Task</h2>
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <button type="submit">Update Task</button>
            <button
              type="button"
              onClick={() => {
                setEditingTask(null);
                setForm({ title: '', description: '', dueDate: '', priority: 'Medium' });
              }}
            >
              Cancel
            </button>
          </form>
        )}

        <ul>
          {tasks.length === 0 ? (
            <p>No tasks available</p>
          ) : (
            tasks.map((task) => (
              <li key={task._id}>
                <h3>{task.title}</h3>
                <p>{task.description}</p>
                <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                <p>Priority: {task.priority}</p>
                <button onClick={() => handleEdit(task)}>Edit</button>
                <button onClick={() => handleDelete(task._id)}>Delete</button>
                <button onClick={() => handleViewDetails(task)}>Details</button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default TaskList;
