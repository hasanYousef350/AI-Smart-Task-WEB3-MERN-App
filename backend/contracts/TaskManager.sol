// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

contract TaskManager {
    uint256 public nextTaskId = 0;
    struct Task {
        string title;
        address assignee;
        uint256 dueDate;
    }

    Task[] public tasks;

    event TaskCreated(uint256 indexed taskId, string title, address assignee, uint256 dueDate);
    event TaskUpdated(uint256 indexed taskId, string title, address assignee, uint256 dueDate);
    
    function createTask(string memory title, address assignee, uint256 dueDate) public {
        tasks.push(Task(title, assignee, dueDate));
        emit TaskCreated(tasks.length - 1, title, assignee, dueDate);
    }
    
    function updateTask(
        uint256 _taskId,
        string memory _title,
        address _assignee,
        uint256 _dueDate
    ) public {
        require(_taskId < nextTaskId, "Task does not exist");
        tasks[_taskId] = Task(_title, _assignee, _dueDate);
        emit TaskUpdated(_taskId, _title, _assignee, _dueDate);
    }

    function getTask(uint taskId) public view returns (string memory, address, uint256) {
        Task memory t = tasks[taskId];
        return (t.title, t.assignee, t.dueDate);
    }
}
