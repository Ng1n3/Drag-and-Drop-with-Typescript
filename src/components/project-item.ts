/// <reference path="base.ts"/>
/// <reference path="../decorators/autobind-decorator.ts"/>
/// <reference path="../models/project.ts"/>
/// <reference path="../models/drag-drop.ts"/>

namespace App {
  //ProjectItem class
  export class ProjecItem
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
}