namespace App {
  // project status
  export enum ProjectStatus {
    Active,
    Finished,
  }

  // Project TYpe
  export class Project {
    constructor(
      public id: string,
      public title: string,
      public description: string,
      public people: number,
      public status: ProjectStatus
    ) {}
  }
}