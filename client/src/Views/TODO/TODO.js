import { useEffect, useState } from 'react';
import Styles from './TODO.module.css';
import { dummy } from './dummy';
import axios from 'axios';

export function TODO(props) {

    const [newTodo, setNewTodo] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [todoData, setTodoData] = useState(dummy);
    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(null);  
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        const fetchTodo = async () => {
            const apiData = await getTodo();
            setTodoData(apiData);
            setLoading(false);
        }
        fetchTodo();
    }, []);

    const getTodo = async () => {
        const options = {
            method: "GET",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            }
        }
        try {
            const response = await axios.request(options);
            return response.data;
        } catch (err) {
            console.log(err);
            return []; 
        }
    }

    const addTodo = () => {
        const options = {
            method: "POST",
            url: `http://localhost:8000/api/todo`,
            headers: {
                accept: "application/json",
            },
            data: {
                title: newTodo,
                description: newDescription  
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => [...prevData, response.data.newTodo]);
            })
            .catch((err) => {
                console.log(err);
            })
    }

    const deleteTodo = (id) => {
        const options = {
            method: "DELETE",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.filter(todo => todo._id !== id));
            })
            .catch((err) => {
                console.log(err);
            })
    };

    const updateTodo = (id, updatedData = {}) => {
        const todoToUpdate = todoData.find(todo => todo._id === id);
        const options = {
            method: "PATCH",
            url: `http://localhost:8000/api/todo/${id}`,
            headers: {
                accept: "application/json",
            },
            data: {
                ...todoToUpdate,
                ...updatedData  // Include updated title and description
            }
        }
        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                setTodoData(prevData => prevData.map(todo => todo._id === id ? response.data : todo));
                setEditing(null);  // Stop editing after update
            })
            .catch((err) => {
                console.log(err);
            })
    };

    const handleEdit = (id, title, description) => {
        setEditing(id);
        setEditTitle(title);
        setEditDescription(description);
    }

    const saveEdit = (id) => {
        updateTodo(id, { title: editTitle, description: editDescription });
    }

    const cancelEdit = () => {
        setEditing(null);
    }

    return (
        <div className={Styles.ancestorContainer}>
            <div className={Styles.headerContainer}>
                <h1 className={Styles.one}>
                    Tasks
                </h1>
                <span>
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Todo'
                        placeholder='Title'
                        value={newTodo}
                        onChange={(event) => {
                            setNewTodo(event.target.value)
                        }}
                    />
                    <input
                        className={Styles.todoInput}
                        type='text'
                        name='New Description'
                        placeholder='Description'
                        value={newDescription}
                        onChange={(event) => {
                            setNewDescription(event.target.value)
                        }}
                    />
                    <button
                        id='addButton'
                        name='add'
                        className={Styles.addButton}
                        onClick={() => {
                            addTodo();
                            setNewTodo('');
                            setNewDescription('');
                        }}
                    >
                        + New Todo
                    </button>
                </span>
            </div>
            <div id='todoContainer' className={Styles.todoContainer}>
                {loading ? (
                    <p style={{ color: 'white' }}>Loading...</p>
                ) : (
                    todoData.length > 0 ? (
                        todoData.map((entry, index) => (
                            <div key={entry._id} className={Styles.todo}>
                                {editing === entry._id ? (
                                    <>
                                        <span className={Styles.infoContainer}>
                                            <input
                                                type='checkbox'
                                                checked={entry.done}
                                                onChange={() => {
                                                    updateTodo(entry._id, { done: !entry.done });
                                                }}
                                            />
                                            <input
                                                type='text'
                                                value={editTitle}
                                                
                                                className={Styles.title}
                                                onChange={(event) => setEditTitle(event.target.value)}
                                            />
                                            <input
                                                type='text'
                                                value={editDescription}
                                                
                                                onChange={(event) => setEditDescription(event.target.value)}
                                            />
                                        </span>
                                        <span style={{ cursor: 'pointer' }} onClick={() => saveEdit(entry._id)}>
                                            Save
                                        </span>
                                        <span style={{ cursor: 'pointer' }} onClick={cancelEdit}>
                                            Cancel
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <span className={Styles.infoContainer}>
                                            <input
                                                type='checkbox'
                                                checked={entry.done}
                                                onChange={() => {
                                                    updateTodo(entry._id, { done: !entry.done });
                                                }}
                                            />
                                            <span>{entry.title}</span><br />
                                            <span className={Styles.des}>{entry.description}</span>
                                        </span>
                                        <span style={{ cursor: 'pointer' }} 
                                        
                                        onClick={() => handleEdit(entry._id, entry.title, entry.description)}>
                                            Edit
                                        </span>
                                        <span style={{ cursor: 'pointer' }} onClick={() => deleteTodo(entry._id)}>
                                            Delete
                                        </span>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <p className={Styles.noTodoMessage}>No tasks available. Please add a new task.</p>
                    )
                )}
            </div>
        </div>
    )
}

