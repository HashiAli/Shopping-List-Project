const itemName = document.querySelector(".item-name")
const quantity = document.querySelector(".quantity")
const priority = document.querySelector('input[name="Priority"]:checked')
const additionalNote = document.getElementById("addNote")
const itemSubmit = document.getElementById("submit");
const itemFilter = document.getElementById("srch-input");
const tableBody = document.querySelector("tbody")
const removeBtn = tableBody.querySelectorAll(".delete-btn");
const clearBtn = document.getElementById("clr-btn");
const editBtn = tableBody.querySelectorAll(".edit-btn");
const regex = /^[a-zA-Z0-9]+$/;
let isEditMode = false;

function showNotification(message ,color) {
  const msgCon = document.querySelector('#notifi');
  const notification = document.createElement("div");
  let classes = "w-full h-full rounded shadow-md p-3 text-2xl text-center text-white mb-3" +" bg-"+color+"-600"
  notification.className = classes
  notification.innerHTML = `<p>${message}</p>`;
  notification.classList.add("show");
  msgCon.appendChild(notification)

  // Automatically hide the notification after 3 seconds
  setTimeout(() => {

    notification.classList.remove("show");
    notification.classList.add("hide");
    setTimeout(() => {
      msgCon.removeChild(notification)
    }, 1000)
  }, 2500);
}
function toPascalCase(str) {
  return str
    .split(/[\s-_]+/) // Split by spaces, hyphens, or underscores
    .map(word => {
      return word.charAt(0).toUpperCase() + "" + word.slice(1).toLowerCase();
    })
    .join(' ');
}
function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function displayItems() {
  const itemsFromStorage = getItemsFromStorage();
  itemsFromStorage.forEach((item) => addItemToDOM(item));
  checkUI();
}

function onAddItemSubmit(e) {
  e.preventDefault();

  if (itemName.value === "" || quantity.value === "") {
      showNotification("Please fill in all fields !", "red");
      return;
  }
  else if(!regex.test(itemName.value)){
    showNotification("Item name should only contain alphanumeric characters.","blue");
    return;
  }
  // Check for edit mode
  if (isEditMode) {
    const itemToEdit = tableBody.querySelector(".edit-mode");

    removeItemFromStorage(itemToEdit.textContent);
    itemToEdit.classList.remove("edit-mode");
    itemToEdit.remove();
    isEditMode = false;
  }

  else {
    if (checkIfItemExists(itemName.value)) {
      showNotification("That item already exists!","yellow");
      return;
    }
  }
  // Add item to local storage
  addItemToStorage(itemName.value, quantity.value, priority.defaultValue, additionalNote.value);
  let items = { itemName: itemName.value, quantity: quantity.value, priority: priority.defaultValue, additionalNote: additionalNote.value }
  addItemToDOM(items);
  checkUI()
  showNotification("Item added successfully!","green");
  // document.querySelector("form").reset();
}



function addItemToDOM(item) {
  let classes ="bg-white even:bg-gray-50 hover:bg-blue-100"
  let editClass ="text-blue-500 hover:text-blue-700 edit-btn ml-3"
  const tr = document.createElement("tr");
  tr.innerHTML = 
                  `<td class="p-2 itemname">${toPascalCase(item.itemName)}</td>
                  <td class="p-2">${item.priority}</td>
                  <td class="p-2">${item.quantity}</td>
                  <td class="p-2">${capitalizeFirstLetter(item.additionalNote)}</td>`;
  tr.className=classes
  const td = document.createElement("td");
  td.classList.add("p-2")
  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.className=editClass;
  editBtn.addEventListener("click", () => setItemToEdit(tr));
  let delClass="text-red-500 hover:text-red-700 delete-btn"
  const removeBtn = document.createElement("button");
  removeBtn.textContent = "Delete";
  removeBtn.className=delClass
  removeBtn.addEventListener("click", () => removeItem(tr));

  td.appendChild(removeBtn);
  td.appendChild(editBtn);
  tr.appendChild(td);
  tableBody.appendChild(tr);

}


function addItemToStorage(itemName, quantity, priority, additionalNote) {
  const itemsFromStorage = getItemsFromStorage();

  // Add new item to array
  itemsFromStorage.push({ itemName, quantity, priority, additionalNote });

  // Convert to JSON string and set to local storage
  localStorage.setItem("items", JSON.stringify(itemsFromStorage));
}

function getItemsFromStorage() {
  let itemsFromStorage = localStorage.getItem("items")

  if (itemsFromStorage === null) {
    itemsFromStorage = [];
  } else {
    itemsFromStorage = JSON.parse(localStorage.getItem("items"));
  }

  return itemsFromStorage;
}

function clearItems() {
  if (confirm("Are you sure to clear All Items?")) {
    // Clear from DOM
    localStorage.clear();
    while (tableBody.firstChild) {
      tableBody.removeChild(tableBody.firstChild);
    }
    // Clear from localStorage
    showNotification("All items cleared successfully!","blue"); 
    checkUI();
  }
}
function checkUI() {

  const items = tableBody.querySelectorAll("tr");

  if (items.length === 0) {
    clearBtn.style.display = "none";
    // itemFilter.style.display = "none";
  } else {
    clearBtn.style.display = "block";
    // itemFilter.style.display = "block";
  }
  const counter = document.getElementById("counter");
  counter.textContent = `Total Items: ${items.length}`;

  // formBtn.innerHTML = '<i class="fa-solid fa-plus"></i> Add Item';
  // formBtn.style.backgroundColor = "#333";

  isEditMode = false;
}
function checkIfItemExists(item) {
  const itemsFromStorage = getItemsFromStorage();
  let exists = false;

  itemsFromStorage.forEach((e) => {
    if (e.itemName.toLowerCase() === item.toLowerCase()) {
      exists = true;
    }
    return exists
  });

  // console.log(`Item ${item} exists: ${exists}`);
  return exists
  
}
function removeItem(item) {
    // Remove item from DOM
    item.remove()

    // Remove item from local storage

    removeItemFromStorage(item);
    checkUI()
  
}

function removeItemFromStorage(item) {
  let itemsFromStorage = getItemsFromStorage();
  let itemName=item.querySelector(".itemname").textContent.toLowerCase();
  // Filter out item to be removed
  itemsFromStorage = itemsFromStorage.filter((i) => i.itemName !== itemName);
  // Re-set to localstorage
  localStorage.setItem("items", JSON.stringify(itemsFromStorage));
  showNotification("Item removed successfully!","red");
}











function setItemToEdit(item) {
  isEditMode = true;
  tableBody
    .querySelectorAll("tr")
    .forEach((i) => i.classList.remove("edit-mode"));

  item.classList.add("edit-mode");
  itemSubmit.innerHTML = 'Update Item';
  itemName.value = item.firstChild.textContent;
  quantity.value = item.children[2].textContent;
  priority.value = item.children[1].defaultValue
  additionalNote.value = item.children[3].value

}

function filterItems(e) {
  let filteredItems = [];
  const items = tableBody.querySelectorAll("tr");
  const text = itemFilter.value.toLowerCase()
  if(!text==""){
  items.forEach((item) => {
    const firstCell = item.firstElementChild; // Access the first child (first <td>)
    if (firstCell.textContent.toLowerCase().includes(text)) {
      const secondCell = firstCell.nextElementSibling; // Access the second <td>
      const thirdCell = secondCell.nextElementSibling; // Access the third <td>
      const fourthCell = thirdCell.nextElementSibling;
      let data={ itemName:firstCell.textContent,priority: secondCell.textContent, quantity:thirdCell.textContent,additionalNote:fourthCell.textContent}
      // console.log(data);
      tableBody.innerHTML=""
      addItemToDOM(data)
      
      
      
    }
  });}
  else{
    displayItems()
  }
}


// Initialize app
function init() {
  // Event Listeners
  itemSubmit.addEventListener("click", onAddItemSubmit);
  clearBtn.addEventListener("click", clearItems);
  // itemFilter.addEventListener("input", filterItems);
  document.addEventListener("DOMContentLoaded", displayItems);
}

init();
