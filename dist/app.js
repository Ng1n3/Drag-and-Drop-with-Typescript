"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
class Project {
    constructor(id, title, description, people, status) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.people = people;
        this.status = status;
    }
}
class State {
    constructor() {
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
}
class ProjectState extends State {
    constructor() {
        super();
        this.projects = [];
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numberOfPeople) {
        const newProject = new Project(Math.random().toString(), title, description, numberOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        this.updateListeners();
    }
    moveProject(projectId, newStatus) {
        const project = this.projects.find((prj) => prj.id === projectId);
        if (project && project.status !== newStatus) {
            project.status = newStatus;
            this.updateListeners();
        }
    }
    updateListeners() {
        for (const listnerFn of this.listeners) {
            listnerFn(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
function validate(validateableInput) {
    let isValid = true;
    if (validateableInput.required) {
        isValid = isValid && validateableInput.value.toString().trim().length !== 0;
    }
    if (validateableInput.minLength != null &&
        typeof validateableInput.value === "string") {
        isValid =
            isValid && validateableInput.value.length > validateableInput.minLength;
    }
    if (validateableInput.maxLength != null &&
        typeof validateableInput.value === "string") {
        isValid =
            isValid && validateableInput.value.length > validateableInput.maxLength;
    }
    if (validateableInput.min != null &&
        typeof validateableInput.value === "number") {
        isValid = isValid && validateableInput.value >= validateableInput.min;
    }
    if (validateableInput.max != null &&
        typeof validateableInput.value === "number") {
        isValid = isValid && validateableInput.value <= validateableInput.max;
    }
    return isValid;
}
function autoBind(_, _2, descriptor) {
    const originalMethod = descriptor.value;
    const adjDescriptor = {
        configurable: true,
        enumerable: false,
        get() {
            const boundFn = originalMethod.bind(this);
            return boundFn;
        },
    };
    return adjDescriptor;
}
class Component {
    constructor(templateId, hostElementId, insertAtStart, newElementId) {
        this.templateElement = (document.getElementById(templateId));
        this.hostElement = document.getElementById(hostElementId);
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        if (newElementId) {
            this.element.id = newElementId;
        }
        this.attach(insertAtStart);
    }
    attach(insertAtBegining) {
        this.hostElement.insertAdjacentElement(insertAtBegining ? "afterbegin" : "beforeend", this.element);
    }
}
class ProjecItem extends Component {
    get persons() {
        if (this.project.people === 1) {
            return "1 Person";
        }
        else {
            return `${this.project.people} Persons`;
        }
    }
    constructor(hostId, project) {
        super("single-project", hostId, false, project.id);
        this.project = project;
        this.configure();
        this.renderContent();
    }
    dragStartHandler(event) {
        event.dataTransfer.setData("text/plain", this.project.id);
        event.dataTransfer.effectAllowed = "move";
    }
    dragEndHanlder(_) {
        console.log("DragEnd");
    }
    configure() {
        this.element.addEventListener("dragstart", this.dragStartHandler);
        this.element.addEventListener("dragend", this.dragEndHanlder);
    }
    renderContent() {
        this.element.querySelector("h2").textContent = this.project.title;
        this.element.querySelector("h3").textContent =
            this.persons.toString() + " Assigned";
        this.element.querySelector("p").textContent = this.project.description;
    }
}
__decorate([
    autoBind
], ProjecItem.prototype, "dragStartHandler", null);
class ProjectList extends Component {
    constructor(type) {
        super("project-list", "app", false, `${type} - projects`);
        this.type = type;
        this.assignedProject = [];
        this.configure();
        this.renderContent();
    }
    dragOverHandler(event) {
        if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
            event.preventDefault();
            const listEl = this.element.querySelector("ul");
            listEl.classList.add("droppable");
        }
    }
    dropHandler(event) {
        const prjId = event.dataTransfer.getData("text/plain");
        projectState.moveProject(prjId, this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished);
    }
    dragLeaveHander(_) {
        const listEl = this.element.querySelector("ul");
        listEl.classList.remove("droppable");
    }
    configure() {
        this.element.addEventListener("dragover", this.dragOverHandler);
        this.element.addEventListener("dragleave", this.dragLeaveHander);
        this.element.addEventListener("drop", this.dropHandler);
        projectState.addListener((projects) => {
            const relevantProjects = projects.filter((prj) => {
                if (this.type === "active") {
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            });
            this.assignedProject = relevantProjects;
            this.renderProjects();
        });
    }
    renderContent() {
        const listId = `${this.type} - projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent =
            this.type.toUpperCase() + " PROJECTS";
    }
    renderProjects() {
        const listEl = (document.getElementById(`${this.type} - projects-list`));
        listEl.innerHTML = "";
        for (const prjItem of this.assignedProject) {
            new ProjecItem(this.element.querySelector("ul").id, prjItem);
        }
    }
}
__decorate([
    autoBind
], ProjectList.prototype, "dragOverHandler", null);
__decorate([
    autoBind
], ProjectList.prototype, "dropHandler", null);
__decorate([
    autoBind
], ProjectList.prototype, "dragLeaveHander", null);
class projectInput extends Component {
    constructor() {
        super("project-input", "app", true, "user-input");
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionElement = this.element.querySelector("#description");
        this.peopleElement = this.element.querySelector("#people");
        this.attach();
        this.configure();
    }
    configure() {
        this.element.addEventListener("submit", this.submitHanlder);
    }
    renderContent() { }
    gatherUseInput() {
        const enteredTitle = this.titleInputElement.value;
        const enterdDescription = this.descriptionElement.value;
        const enteredPeople = this.peopleElement.value;
        const titleValidatable = {
            value: enteredTitle,
            required: true,
        };
        const descriptionValidatable = {
            value: enterdDescription,
            required: true,
            minLength: 5,
        };
        const peopleValidatable = {
            value: enteredPeople,
            required: true,
            min: 1,
            max: 5,
        };
        if (!validate(titleValidatable) ||
            !validate(descriptionValidatable) ||
            !validate(peopleValidatable)) {
            alert("Invalid input, please try again!");
            return;
        }
        else {
            return [enteredTitle, enterdDescription, +enteredPeople];
        }
    }
    clearInputs() {
        this.titleInputElement.value = "";
        this.descriptionElement.value = "";
        this.peopleElement.value = "";
    }
    submitHanlder(e) {
        e.preventDefault();
        const userInput = this.gatherUseInput();
        if (Array.isArray(userInput)) {
            const [title, description, people] = userInput;
            projectState.addProject(title, description, people);
            this.clearInputs();
        }
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
}
__decorate([
    autoBind
], projectInput.prototype, "submitHanlder", null);
const prjnput = new projectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
//# sourceMappingURL=app.js.map