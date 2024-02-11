document.addEventListener('DOMContentLoaded', function () {
    const taskList = document.getElementById('taskList');

    const sortableTaskList = new Sortable(taskList, {
        animation: 150,
        onUpdate: function () {
            saveSortableOrder(taskList, 'taskListOrder');
        }
    });

    loadSortableOrder(taskList, 'taskListOrder');
});

function saveSortableOrder(list, key) {
    const order = Array.from(list.children).map(item => item.getAttribute('data-task-id'));
    const taskItems = {};
    order.forEach(id => {
        const item = list.querySelector(`[data-task-id="${id}"]`);
        if (item) {
            taskItems[id] = item.cloneNode(true); // Store a clone of the DOM element
        }
    });
    localStorage.setItem(key, JSON.stringify({ order, taskItems }));
    console.log("saveSortableOrder is: ", order);
}



function loadSortableOrder(list, key) {
    const { order, taskItems } = JSON.parse(localStorage.getItem(key)) || { order: null, taskItems: null };
    if (order && taskItems) {
        order.forEach(id => {
            const item = taskItems[id];
            console.log(item)
            if (item) {
                list.appendChild(item); // Append the cloned item
            }
        });
    }
}





    //save the sorting order of additionalTaskList
    document.addEventListener('DOMContentLoaded', function () {
        const additionalTaskList = document.getElementById('additionalTaskList');

        // Initialize sortable library for additional task list
        const sortableAdditionalTaskList = new Sortable(additionalTaskList, {
            animation: 150,
            onUpdate: function () {
                saveSortableOrder(additionalTaskList, 'additionalTaskListOrder');
            }
        });

        // Function to save sortable order to local storage
        function saveSortableOrder(list, key) {
            const order = Array.from(list.children).map(item => item.getAttribute('data-task-id'));
            localStorage.setItem(key, JSON.stringify(order));
            console.log("saveSortableOrder LtTask is: ", order);
        }

        // Function to load sortable order from local storage
        function loadSortableOrder(list, key) {
            const order = JSON.parse(localStorage.getItem(key));
            // console.log("loadSortableOrder LtTask is: ", order);
            if (order) {
                order.forEach(id => {
                    const item = document.querySelector(`.taskItem[data-task-id="${id}"]`);
                    if (item) {
                        // Append the item to the list according to the saved order
                        list.appendChild(item);
                    }
                });
            }
        }

        // Load sortable order for additional task list
        loadSortableOrder(additionalTaskList, 'additionalTaskListOrder');
    });