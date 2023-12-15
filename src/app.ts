// Drag & Drop Interfaces
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHanlder(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHander(event: DragEvent): void;
}

//  project status
enum ProjectStatus {
  Active,
  Finished,
}

// Project TYpe
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

//build a class that manages states
type Listener<T> = (items: T[]) => void;

class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listenerFn: Listener<T>) {
    this.listeners.push(listenerFn);
  }
}

class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;
  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, numberOfPeople: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numberOfPeople,
      ProjectStatus.Active
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(projectId: string, newStatus: ProjectStatus) {
    const project = this.projects.find((prj) => prj.id === projectId);
    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listnerFn of this.listeners) {
      listnerFn(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(validateableInput: Validatable) {
  let isValid = true;
  if (validateableInput.required) {
    isValid = isValid && validateableInput.value.toString().trim().length !== 0;
  }

  if (
    validateableInput.minLength != null &&
    typeof validateableInput.value === "string"
  ) {
    isValid =
      isValid && validateableInput.value.length > validateableInput.minLength;
  }

  if (
    validateableInput.maxLength != null &&
    typeof validateableInput.value === "string"
  ) {
    isValid =
      isValid && validateableInput.value.length > validateableInput.maxLength;
  }

  if (
    validateableInput.min != null &&
    typeof validateableInput.value === "number"
  ) {
    isValid = isValid && validateableInput.value >= validateableInput.min;
  }

  if (
    validateableInput.max != null &&
    typeof validateableInput.value === "number"
  ) {
    isValid = isValid && validateableInput.value <= validateableInput.max;
  }
  return isValid;
}

function autoBind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
}

// Component class
abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string
  ) {
    this.templateElement = <HTMLTemplateElement>(
      document.getElementById(templateId)!
    );
    this.hostElement = <T>document.getElementById(hostElementId)!;
    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );
    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }
    this.attach(insertAtStart);
  }

  attach(insertAtBegining: boolean) {
    this.hostElement.insertAdjacentElement(
      insertAtBegining ? "afterbegin" : "beforeend",
      this.element
    );
  }

  abstract configure?(): void;
  abstract renderContent(): void;
}

//ProjectItem class
class ProjecItem
  extends Component<HTMLUListElement, HTMLLIElement>
  implements Draggable
{
  private project: Project;

  get persons() {
    if (this.project.people === 1) {
      return "1 Person";
    } else {
      return `${this.project.people} Persons`;
    }
  }

  constructor(hostId: string, project: Project) {
    super("single-project", hostId, false, project.id);
    this.project = project;
    this.configure();
    this.renderContent();
  }

  @autoBind
  dragStartHandler(event: DragEvent): void {
    event.dataTransfer!.setData("text/plain", this.project.id);
    event.dataTransfer!.effectAllowed = "move";
  }

  dragEndHanlder(_: DragEvent): void {
    console.log("DragEnd");
  }
  configure() {
    this.element.addEventListener("dragstart", this.dragStartHandler);
    this.element.addEventListener("dragend", this.dragEndHanlder);
  }
  renderContent() {
    this.element.querySelector("h2")!.textContent = this.project.title;
    this.element.querySelector("h3")!.textContent =
      this.persons.toString() + " Assigned";
    this.element.querySelector("p")!.textContent = this.project.description;
  }
}

// ProjectList Class
class ProjectList
  extends Component<HTMLDivElement, HTMLElement>
  implements DragTarget
{
  assignedProject: Project[];

  constructor(private type: "active" | "finished") {
    super("project-list", "app", false, `${type} - projects`);
    this.assignedProject = [];

    this.configure();
    this.renderContent();
  }

  @autoBind
  dragOverHandler(event: DragEvent): void {
    if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
      event.preventDefault();
      const listEl = this.element.querySelector("ul")!;
      listEl.classList.add("droppable");
    }
  }

  @autoBind
  dropHandler(event: DragEvent): void {
    const prjId = event.dataTransfer!.getData("text/plain");
    projectState.moveProject(
      prjId,
      this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
    );
  }
  @autoBind
  dragLeaveHander(_: DragEvent): void {
    const listEl = this.element.querySelector("ul")!;
    listEl.classList.remove("droppable");
  }

  configure() {
    this.element.addEventListener("dragover", this.dragOverHandler);
    this.element.addEventListener("dragleave", this.dragLeaveHander);
    this.element.addEventListener("drop", this.dropHandler);
    projectState.addListener((projects: Project[]) => {
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
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  }

  private renderProjects() {
    const listEl = <HTMLUListElement>(
      document.getElementById(`${this.type} - projects-list`)!
    );
    listEl.innerHTML = "";
    for (const prjItem of this.assignedProject) {
      new ProjecItem(this.element.querySelector("ul")!.id, prjItem);
    }
  }
}

class projectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionElement: HTMLInputElement;
  peopleElement: HTMLInputElement;

  constructor() {
    super("project-input", "app", true, "user-input");
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.attach();
    this.configure();
  }

  configure() {
    this.element.addEventListener("submit", this.submitHanlder);
  }

  renderContent() {}

  private gatherUseInput(): [string, string, number] | void {
    const enteredTitle = this.titleInputElement.value;
    const enterdDescription = this.descriptionElement.value;
    const enteredPeople = this.peopleElement.value;

    const titleValidatable: Validatable = {
      value: enteredTitle,
      required: true,
    };

    const descriptionValidatable: Validatable = {
      value: enterdDescription,
      required: true,
      minLength: 5,
    };
    const peopleValidatable: Validatable = {
      value: enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !validate(titleValidatable) ||
      !validate(descriptionValidatable) ||
      !validate(peopleValidatable)
    ) {
      alert("Invalid input, please try again!");
      return;
    } else {
      return [enteredTitle, enterdDescription, +enteredPeople];
    }
  }

  private clearInputs() {
    this.titleInputElement.value = "";
    this.descriptionElement.value = "";
    this.peopleElement.value = "";
  }

  @autoBind
  private submitHanlder(e: Event) {
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

const prjnput = new projectInput();
const activePrjList = new ProjectList("active");
const finishedPrjList = new ProjectList("finished");
