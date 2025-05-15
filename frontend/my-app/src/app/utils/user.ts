// utils/User.ts

export class User {
    avatar: string ;
    id : string ;
    username: string;
    status: string;

    progress: number;
    level: number;
    friends: string[] = [];

    constructor(avatar:string,username: string, progress: number, level: number, friends: string[], status: string , id: string) {
      this.username = username;
      this.status = status;
      this.id = id;
      this.progress = progress;
      this.level = level;
      this.friends = friends;
      this.avatar = avatar;
    }
  
   
    getUserInfo(): string {
      return `${this.username} is at level ${this.level} with ${this.progress}% progress.`;
    }
  }
  