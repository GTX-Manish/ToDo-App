import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from '../styles/modules/app.module.scss';
import style from '../styles/modules/button.module.scss';
import TodoItem from './TodoItem';
import { deleteTodo, addTodo } from '../slices/todoSlice';

const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};
const child = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

function AppContent() {
  const todoList = useSelector((state) => state.todo.todoList);
  const filterStatus = useSelector((state) => state.todo.filterStatus);
  const dispatch = useDispatch();
  const sortedTodoList = [...todoList].sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
  const filteredTodoList = sortedTodoList.filter(
    (item) => filterStatus === 'all' || item.status === filterStatus
  );

  // State for deleted task
  const [deletedTask, setDeletedTask] = useState(null);
  const [showUndo, setShowUndo] = useState(false);

  // Delete function: properly removes task from Redux
  const handleDelete = (todo) => {
    setDeletedTask(todo); // Store deleted task temporarily
    dispatch(deleteTodo(todo.id)); // Remove from Redux state

    setShowUndo(true);

    // If undo is not clicked within 5 seconds, clear deletedTask
    setTimeout(() => {
      setShowUndo(false);
      setDeletedTask(null);
    }, 5000);
  };

  // Undo function: restores the deleted task if Undo is clicked
  const handleUndo = () => {
    if (deletedTask) {
      dispatch(addTodo(deletedTask)); // Add it back to Redux
      setDeletedTask(null);
      setShowUndo(false);
    }
  };

  return (
    <motion.div
      className={styles.content__wrapper}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence>
        {filteredTodoList.length > 0 ? (
          filteredTodoList.map((todo) => (
            <TodoItem key={todo.id} todo={todo} handleDelete={handleDelete} />
          ))
        ) : (
          <motion.p variants={child} className={styles.emptyText}>
            No Todos
          </motion.p>
        )}
      </AnimatePresence>

      {/* Undo Button appears only when a task is deleted */}
      {showUndo && deletedTask && (
        <motion.div
          className={styles.undoContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            className={style.undoButton}
            type="button"
            onClick={handleUndo}
          >
            Undo Delete
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AppContent;
