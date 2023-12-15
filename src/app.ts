/// <reference path="models/drag-drop.ts"/>
/// <reference path="models/project.ts"/>
/// <reference path="state/project-state.ts"/>
/// <reference path="util/validation.ts"/>
/// <reference path="decorators/autobind-decorator.ts"/>
/// <reference path="components/project-input.ts"/>
/// <reference path="components/project-list.ts"/>


namespace App {
  new projectInput();
  new ProjectList("active");
  new ProjectList("finished");
}
