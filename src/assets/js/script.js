import { todoService } from "../../service/todoService";

const TodoApp = {
  currentTab: "all",

  init() {
    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);
    this.todoList = $("#todo-list");
    this.addTodo = $("#add-todo");
    this.todoInput = $("#todo-input");
    this.editInput = $(".edit-input");
    this.editModal = $("#edit-modal");
    this.editCancel = $("#cancel-edit");
    this.saveEdit = $("#save-edit");
    this.tabs = $$(".tabs button");

    this.restoreTab();
    this.loadTodos();
    this.eventManagement();
  },

  async loadTodos() {
    let data;
    if (this.currentTab === "completed") {
      data = await todoService.getByQuery({ completed: true });
    } else if (this.currentTab === "incomplete") {
      data = await todoService.getByQuery({ completed: false });
    } else {
      data = await todoService.getAll();
    }

    this.todoList.innerHTML = "";
    this.renderTodos(data);
    this.setActiveTab(this.currentTab);
  },

  renderTodos(todos) {
    todos.forEach((todo) => {
      const li = document.createElement("li");
      li.className = `flex justify-between items-center p-2 border rounded-lg ${
        todo.completed ? "bg-green-100" : "bg-gray-50"
      }`;
      li.innerHTML = `
      <span class="${todo.completed ? "line-through" : ""}">${todo.title}</span>
      <div class="ctrl flex space-x-2" data-id="${todo.id}">
        <button class="edit-btn bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-400">Edit</button>
        <button class="btn delete-btn bg-red-100 text-white p-1 rounded hover:bg-red-200">
          <svg class="svg-icon card-icon"><use xlink:href="#trash"></use></svg>
        </button>
        <button class="btn toggle-btn bg-green-500 text-white p-1 rounded hover:bg-green-600">
          <svg class="svg-icon card-icon">
            <use xlink:href="${todo.completed ? "#completed" : "#incomplete"}"></use>
          </svg>
        </button>
      </div>
    `;
      this.todoList.prepend(li);
    });
  },

  eventManagement() {
    this.addTodo.onclick = () => this.addNewTodo();
    this.todoInput.onkeypress = (e) => {
      if (e.key === "Enter") this.addNewTodo();
    };
    this.todoList.onclick = (e) => this.handleUpdateTodo(e);
    this.editCancel.onclick = (e) => this.hideEditModal(e);
    this.saveEdit.onclick = (e) => this.confirmEdit(e);

    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const selectedTab = tab.dataset.tab;
        this.currentTab = selectedTab;

        const newUrl = new URL(window.location);
        newUrl.searchParams.set("tab", this.currentTab);
        history.pushState(null, "", newUrl);
        this.loadTodos();
      });
    });
  },

  async addNewTodo() {
    const title = this.todoInput.value.trim();
    if (!title || /^\d+$/.test(title)) return;

    try {
      const todo = await todoService.create({ title, completed: false });
      this.renderTodos([todo]);
      this.todoInput.value = "";
    } catch (error) {
      console.error("Has Error adding todo:", error);
    }
  },

  setActiveTab(tabName) {
    this.tabs.forEach((tab) => {
      tab.classList.toggle("bg-blue-500", tab.dataset.tab === tabName);
      tab.classList.toggle("text-white", tab.dataset.tab === tabName);
    });
  },

  async restoreTab() {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get("tab");
    this.currentTab = ["all", "completed", "incomplete"].includes(tabParam) ? tabParam : "all";
  },

  async handleUpdateTodo(e) {
    const id = e.target.closest(".ctrl")?.dataset.id;
    const editBtn = e.target.closest(".edit-btn");
    const deleteBtn = e.target.closest(".delete-btn");
    const toggleBtn = e.target.closest(".toggle-btn");

    if (!id) {
      return;
    } else if (editBtn) {
      const todo = await todoService.getById(id);
      this.todoBeingEdited = todo;
      this.editInput.value = todo.title;
      this.showEditModal();
    } else if (deleteBtn) {
      await todoService.delete(id);
    } else if (toggleBtn) {
      const todo = await todoService.getById(id);
      await todoService.update(id, {
        ...todo,
        completed: !todo.completed,
      });
    }
    this.loadTodos();
  },

  showEditModal() {
    this.editModal.classList.remove("hidden");
    this.editInput.focus();
  },

  hideEditModal() {
    this.editModal.classList.add("hidden");
    this.todoBeingEdited = null;
    this.editInput.value = "";
  },

  async confirmEdit() {
    const newTitle = this.editInput.value.trim();
    if (!newTitle || !this.todoBeingEdited) return;

    await todoService.update(this.todoBeingEdited.id, {
      ...this.todoBeingEdited,
      title: newTitle,
    });

    this.hideEditModal();
    this.loadTodos();
  },
};

document.addEventListener("DOMContentLoaded", TodoApp.init());

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  console.log(";(node);", e);
});
