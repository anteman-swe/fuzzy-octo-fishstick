// My script used for a todo-list

// declaring type for our tasks, todoItem
interface todoItem {
    todo: string,
    done: boolean
}
// Declaring global variabels and constants
let todoList: Array<todoItem> = []; // Starting with an empty array for tasks, it will get filled by saved items or by user
const inputField: HTMLInputElement | null= document.querySelector('#newTaskInput');
const addButton: HTMLElement | null = document.querySelector('#addButton');
const listShown: HTMLElement = document.querySelector('#todoList') as HTMLElement;
const readyItems: HTMLElement = document.querySelector('#readyItems') as HTMLElement;
const taskAlreadyExist: HTMLElement = document.querySelector('#task-already-exist') as HTMLElement;

let readyItemCounter = 0;
// ##################################################################################################



// #################### Functions to work with local storage ########################################
// Function to save task to local storage
const saveToLocal = (itemToSave: todoItem, index: number = (todoList.length - 1)): void => {
    localStorage.setItem(`task${index}`, JSON.stringify(itemToSave));
}

// Function to update tasks in local storage
const updateLocalDone = (item: number, state: boolean) => {
    let itemTochange: todoItem = JSON.parse(localStorage.getItem(`task${item}`) as string);
    let itemToLoadBack: todoItem = {todo: itemTochange.todo, done: state};
    localStorage.setItem(`task${item}`, JSON.stringify(itemToLoadBack));
}   

// Function to get tasks from local storage
const getFromLocal = (): Array<todoItem> => { 
    let indexCounter: number = 0;
    let  savedTaskArray: Array<todoItem> = [];
    while (indexCounter < localStorage.length) {
        let storageKey:string = localStorage.key(indexCounter) as string;
        let retrievedObject: todoItem = JSON.parse(localStorage.getItem(storageKey) as string);
        let newObject: todoItem = {todo: retrievedObject.todo, done: retrievedObject.done};
        savedTaskArray[indexCounter] = newObject;
        indexCounter++;
    }
    //  To fix errors with keys, clear storage and resave
    localStorage.clear();
    let reIndex: number = 0;
    savedTaskArray.forEach(item => {
        saveToLocal(item, reIndex);
        reIndex++;
    });
    return savedTaskArray;
}

// ##################################################################################################

// ###################### Functions to manipulate the DOM ###########################################
// Function to add ONE row of the tasklist to the DOM 
const addRowToHTML = (taskItem: todoItem): void => {
    // Her we create all neccesary DOM nodes for our task
            const itemAdd: HTMLLIElement = document.createElement('li');
            const itemText: HTMLSpanElement = document.createElement('span');
            const trashCan: HTMLSpanElement = document.createElement('span');
            
            // First we create the trashcan and connect a listener to it
            trashCan.textContent = 'delete';
            trashCan.setAttribute('class', 'material-symbols-outlined');
            trashCan.addEventListener('click', removeTask);
            
            // Second we create our task with its text content
            itemText.textContent = taskItem.todo;
            if(taskItem.done){
                itemText.classList.add('itemDone');
            }
            itemText.classList.add('list-text-content');
            itemText.addEventListener('click', changeTask);
            itemText.addEventListener('dblclick', removeTask);
            
            // Third we put together our complet item to show our task
            itemAdd.appendChild(itemText);
            itemAdd.appendChild(trashCan);
            listShown.appendChild(itemAdd);
}

// Update the visible readycounter in page
const updateReady = (readyCount: number): void => {    
    if (readyCount > 0) {
        readyItems.textContent = `${readyCount} uppgifter färdiga`;
        readyItems.style.backgroundColor = 'rgb(0, 128, 0, 0.5)';
    }
    else if (readyCount == 0 && todoList.length == 0) {
        readyItems.textContent = `Det finns inga uppgifter att göra`;
        readyItems.style.backgroundColor = 'rgb(255, 128, 128, 0.5)';
    }
    else {
        readyItems.textContent = `${readyCount} uppgifter färdiga`;
        readyItems.style.backgroundColor = 'rgb(0, 255, 0, 0.4)';
    }
}

// Function to run first of all after page is loaded so listeners is added and todo-list gets loaded into the DOM
function firstRun(): void {
    // Making sure the input field is clean at start
    cleanInputField()
    // Adding listeners if addButton and inputField exists, if not throw a new error
    if (addButton && inputField) {
        addButton.addEventListener('click', addToDo);
        inputField.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key == 'Enter') {
                addToDo();
            }
        });
    }
    else {
        throw new Error('Variables connected to the DOM has returned null');
    }
    todoList = getFromLocal();
    if (todoList){
        todoList.forEach(item => {
            addRowToHTML(item);
            if (item.done) {
                readyItemCounter++;
            }   
        });
    } else {
        todoList = [];
    }
}
// ##################################################################################################

// ##################### Functions misc #############################################################

// Using DOMPurify to clean the input from any bad content
const cleanInput = (textToClean: string): string => {
    const cleanText: string = textToClean; // Behöver rensas med regex elller trim??
    return cleanText;
}

// reset warning message
const resetWarning = (): void => {
    taskAlreadyExist.textContent = "";
}

// Clean the input field
const cleanInputField = (): void => {
    if (inputField) {
        inputField.value = "";
    } else {
        throw new Error('The input text field is not connected to the DOM');
    }
    
}
// ##################################################################################################

// ##################### Functions to manipulate tasks ##############################################

// Function to find the index in todoList of a given task
const taskFinder = (findText: string): number => {
    // First of all reload the todolist from local storage
    todoList = getFromLocal();
    // find the task in the array and return index, if none found return '-1'
    let arrayIndex: number = -1;
    let arrayCounter: number = 0;
    todoList.forEach(item => {
        if (item.todo.toUpperCase() == findText.toUpperCase()){ // Using toUpperCase() so we not get fooled by different case of letters
            arrayIndex = arrayCounter;
            if (item.done == true && readyItemCounter > 0){
                readyItemCounter--;
            }
        }
        arrayCounter++;
    });
    return arrayIndex;
}

// Function to udate a task status, if done then undone and vice versa
const changeTask = (klick: MouseEvent): void => {
    const whichItem: HTMLElement = klick.target as HTMLElement;
    // Check if task exist in tasklist array
    const itemToChange: number = taskFinder(whichItem.textContent);
    // If task exist and is not null we can change it
    if ((!(itemToChange == -1)) && todoList[itemToChange]) {
        // If task is already done, change it back to undone and last update readycounter
        if (whichItem.classList.contains('itemDone') && todoList[itemToChange].done) {
            whichItem.classList.remove('itemDone');
            todoList[itemToChange].done = false;
            if (readyItemCounter > 0) {
                readyItemCounter--;
            }
            // We also update the task in localStorage
            updateLocalDone(itemToChange, false);
        } else {
            // Else we will set the item as done
            whichItem.classList.add('itemDone');
            todoList[itemToChange].done = true;
            readyItemCounter++;

            // We also update the task in localStorage
            updateLocalDone(itemToChange, true);
        }
        
        // Update visible readycounter
        updateReady(readyItemCounter);
    }
}

//Function to remove items from list, both visble, saved array and local storage
const removeTask = (klick: MouseEvent): void => {
    const whichItem: HTMLElement = klick.target as HTMLElement;
    let itemToRemove: number = -1;
    if (whichItem?.parentNode?.firstChild) {
        const textToSearch: string = whichItem.parentNode.firstChild.textContent as string;
        itemToRemove = taskFinder(textToSearch);
    }
    // If task does not exist, 'itemToRemove = -1' do nothing
    if (!(itemToRemove == -1)) {
        // Remove task from array, localstorage and page
        todoList.splice(itemToRemove, 1);
        localStorage.removeItem(`task${itemToRemove}`);
        // Check if parentNode really exist and then remove it
        if(whichItem?.parentNode) {
            const removableItem: HTMLElement = whichItem.parentNode as HTMLElement; 
            removableItem.remove();
        }  
    }
    // Update visible counter on exit from function
    updateReady(readyItemCounter);
}

// Function to add tasks to the todolist, DOM, Array and Local Storage
function addToDo(): void {
    let itemToAddInput: string = "";
    if (inputField) {
        itemToAddInput = inputField.value;
    } 
    
    
    // If input is empty or doesn't exist we do nothing
    if (!(itemToAddInput == '' || itemToAddInput == null)) {
        // Sending input to be cleaned by cleanInput
        const  itemToAddClean: string = cleanInput(itemToAddInput);

        // ######## Under this line, we do not use dirty input itemToAddInput #######################

        // We check if task already exist, if not we can add it
        const checkTaskExist: number = taskFinder(itemToAddClean);

        // We create the JSON Object to save and show
        let taskToAdd: todoItem = {todo: itemToAddClean, done: false}
        
        // If task didn't exist we will add it / (-1) = task didn't exist
        if (checkTaskExist == -1){
            // Clean comment-field just to be sure
            resetWarning();
            
            // Send the task to be added to list in DOM
            addRowToHTML(taskToAdd);

            // Here we push our task to the array
            todoList.push(taskToAdd);

            // Save the Item to local storage
            saveToLocal(taskToAdd);
            
            // Last we clean the the input field
            cleanInputField();
        } else {
            // If task already existed, we let the user know
            taskAlreadyExist.textContent = "Den uppgiften finns redan, försök med ett annat namn."
            setTimeout(cleanInputField, 3200);
            setTimeout(resetWarning, 3000);
        }
    } else {
        taskAlreadyExist.textContent = "Du måste skriva något i inmatningsfältet för att skapa en uppgift";
        setTimeout(resetWarning, 3000);
        
    }
    updateReady(readyItemCounter);
}

// ##################################################################################################

// Check if there is any saved tasks from before
firstRun();

// Update visible readycounter after first run has checked the todo-list
updateReady(readyItemCounter);
