import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Plus, 
  Calendar, 
  Users, 
  Star,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent } from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import Badge from '../../components/UI/Badge';
import TaskCardMenu from '../../components/UI/TaskCardMenu';
import { taskAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const TaskKanbanView = ({ projectId, tasks: initialTasks, onTasksUpdate, onEditTask, onDeleteTask, onChangeCover }) => {
  const [columns, setColumns] = useState({
    'New': [],
    'In Progress': [],
    'Done': []
  });

  // Initialize columns with tasks grouped by status
  useEffect(() => {
    if (initialTasks) {
      setColumns(initialTasks);
    }
  }, [initialTasks]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'Low': return <CheckCircle className="w-4 h-4" />;
      case 'Medium': return <Clock className="w-4 h-4" />;
      case 'High': return <AlertCircle className="w-4 h-4" />;
      case 'Critical': return <Star className="w-4 h-4 fill-current" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  // Task action handlers
  const handleEditTask = (task) => {
    if (onEditTask) {
      onEditTask(task);
    }
  };

  const handleDeleteTask = (task) => {
    if (onDeleteTask) {
      onDeleteTask(task);
    }
  };

  const handleChangeCover = (task) => {
    if (onChangeCover) {
      onChangeCover(task);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // If there's no destination, return
    if (!destination) return;

    // If the item is dropped in the same position, return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];

    // Get the task being moved
    const draggedTask = sourceColumn[source.index];

    // Create new columns
    const newColumns = { ...columns };

    // Remove from source
    newColumns[source.droppableId] = Array.from(sourceColumn);
    newColumns[source.droppableId].splice(source.index, 1);

    // Add to destination
    newColumns[destination.droppableId] = Array.from(destColumn);
    newColumns[destination.droppableId].splice(destination.index, 0, {
      ...draggedTask,
      status: destination.droppableId
    });

    // Update state immediately for responsive UI
    setColumns(newColumns);

    // Update backend
    try {
      await taskAPI.updateStatus(draggableId, destination.droppableId);
      toast.success('Task status updated');
      if (onTasksUpdate) onTasksUpdate();
    } catch (error) {
      console.error('Error updating task status:', error);
      toast.error('Failed to update task status');
      // Revert on error
      setColumns(columns);
    }
  };

  const TaskCard = ({ task, index }) => {
    // Calculate assignee count
    const assigneesCount = task.assignees?.length || (task.assignee ? 1 : 0);
    
    return (
      <Draggable draggableId={task.id.toString()} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${snapshot.isDragging ? 'rotate-2 opacity-90' : ''}`}
          >
            <Card className={`cursor-pointer hover:shadow-md transition-all duration-200 ${
              snapshot.isDragging ? 'shadow-lg' : ''
            }`}>
              <CardContent className="p-4">
                {/* Cover Image */}
                {task.cover_image && (
                  <div className="mb-3 rounded-lg overflow-hidden">
                    <img 
                      src={task.cover_image} 
                      alt={task.title}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                {/* Task Header - ID and Menu */}
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {task.id}
                    </span>
                  </div>
                  <TaskCardMenu
                    onEdit={() => handleEditTask(task)}
                    onDelete={() => handleDeleteTask(task)}
                    onChangeCover={() => handleChangeCover(task)}
                  />
                </div>

                {/* Project Name */}
                {task.project && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Project: {task.project.name}
                  </p>
                )}

                {/* Priority and Due Date Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <Badge 
                    variant="custom"
                    className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${getPriorityColor(task.priority)}`}
                  >
                    {getPriorityIcon(task.priority)}
                    {task.priority}
                  </Badge>
                  
                  {task.due_date && (
                    <Badge 
                      variant={isOverdue(task.due_date) ? "danger" : "secondary"}
                      className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                    >
                      <Calendar className="w-3 h-3" />
                      {formatDate(task.due_date)}
                    </Badge>
                  )}
                </div>

                {/* Separator Line */}
                <div className="border-t border-gray-200 dark:border-gray-600 mb-3"></div>

                {/* Assignee Count */}
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    {assigneesCount > 0 ? (
                      <span className="font-medium">{assigneesCount} {assigneesCount === 1 ? 'user' : 'users'} assigned</span>
                    ) : (
                      <span>Not assigned</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </Draggable>
    );
  };

  const Column = ({ status, tasks, color }) => (
    <div className={`flex-1 min-h-96 rounded-lg border-2 border-dashed p-4 ${color}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          {status} ({tasks.length})
        </h3>
        <Button
          size="sm"
          variant="ghost"
          className="p-1 h-8 w-8 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          onClick={() => {/* TODO: Add new task */}}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-72 ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600' : ''
            } rounded-lg transition-colors duration-200`}
          >
            {tasks.map((task, index) => (
              <TaskCard key={task.id} task={task} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 h-full overflow-x-auto">
          <Column
            status="New"
            tasks={columns['New'] || []}
            color="border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/10"
          />
          <Column
            status="In Progress"
            tasks={columns['In Progress'] || []}
            color="border-yellow-300 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10"
          />
          <Column
            status="Done"
            tasks={columns['Done'] || []}
            color="border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/10"
          />
        </div>
      </DragDropContext>
    </div>
  );
};

export default TaskKanbanView;