/// <reference path="base.ts"/>

namespace App {
  export class projectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
}