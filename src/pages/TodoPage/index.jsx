import React, { Component } from 'react';
import autoBind from "react-autobind";
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast'
import { Button } from 'primereact/button';
import { Skeleton } from 'primereact/skeleton';
import { TaskList } from './components/TaskList';
import { confirmPopup } from 'primereact/confirmpopup'
import { FormDialog } from './components/FormDialog';
import { FirestoreCollection } from '@react-firebase/firestore';
import { completeTask, converterServerToForm, deleteTask, pinOrUnpinTask, uncompleteTask } from './service';

class TodoPage extends Component {

    constructor(props) {
        super(props);

        autoBind(this);

        this.toast = React.createRef()

        this.state = {
            taskSelected: null,
            isModalFormVisible: false
        }
    }

    bodySkeletonTeplate() {
        return <Skeleton />
    }

    loadingTasksPerStatus(tasks = [], ids = []) {
        let result = { pending: [], completed: [] }

        converterServerToForm(tasks, ids)
            .sort((a, b) => b.pinned - a.pinned)
            .forEach(task => {
                if (task.finished) {
                    result.completed.push(task)
                } else {
                    result.pending.push(task)
                }
            })
        return result
    }

    completeTask(task) {
        completeTask(task)
    }

    updateTask(task) {
        this.setState({ taskSelected: task, isModalFormVisible: true })
    }

    unCompletedTask(task) {
        uncompleteTask(task)
    }

    deleteTask(task, event) {
        this.confirm(event, () => {
            deleteTask(task, () => {
                this.toast.current.show({
                    severity: "success",
                    summary: "Application informs",
                    detail: "Task has been deleted",
                    life: 3000
                })
            })
        })
    }

    confirm(event, onAccept, onReject) {
        confirmPopup({
            target: event.currentTarget,
            message: "Are you sure you want to delete this task?",
            icon: "pi pi-exclamation-triangle",
            accept: onAccept,
            reject: onReject
        })
    }

    pinOrUnpinTask(task) {
        pinOrUnpinTask(task)
    }

    render() {
        return (
            <>
                <Toast ref={this.toast} />
                <div className="p-grid">
                    <div className="p-col-12">
                        <Card
                            className="p-shadow-24"
                            title="Submit a new task"
                            subTitle="You can save unlimited tasks and view on calendar or list viewer in determinated date"
                        >
                            <Button
                                label="New task"
                                icon="pi pi-plus"
                                onClick={() => this.setState({ isModalFormVisible: true })}
                            />
                        </Card>
                    </div>
                    <FirestoreCollection path="/tasks">
                        {({ value = [], ids, isLoading }) => {
                            const { pending, completed } = this.loadingTasksPerStatus(value, ids)

                            return (
                                <>
                                    <div className="p-col-12">
                                        <Card
                                            className="p-shadow-24"
                                            title="Your pending tasks"
                                            subTitle="You can check the tasks clicking on Check button"
                                        >
                                            <TaskList
                                                isLoading={isLoading}
                                                tasks={pending}
                                                completeTasks={this.completeTask}
                                                updateTask={this.updateTask}
                                                deleteTask={this.deleteTask}
                                                pinOrUnpinTask={this.pinOrUnpinTask}
                                            />
                                        </Card>
                                    </div>
                                    <div className="p-col-12">
                                        <Card
                                            className="p-shadow-24"
                                            title="Your completed tasks"
                                            subTitle="Congratulations, you complete these tasks"
                                        >
                                            <TaskList
                                                completedTasks
                                                isLoading={isLoading}
                                                tasks={completed}
                                                completeTasks={this.completeTask}
                                                updateTask={this.updateTask}
                                                deleteTask={this.deleteTask}
                                                pinOrUnpinTask={this.pinOrUnpinTask}
                                                uncompleteTask={this.unCompletedTask}
                                            />
                                        </Card>
                                    </div>
                                </>
                            )
                        }}
                    </FirestoreCollection>
                </div>
                <FormDialog
                    visible={this.state.isModalFormVisible}
                    onHide={() => this.setState({ isModalFormVisible: false, taskSelected: null })}
                    taskSelected={this.state.taskSelected}
                />
            </>
        );
    }
}

export default TodoPage;
