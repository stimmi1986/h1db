// Event
export type Event = {
    id: number;
    name: string;
    slug: string;
    description?: string;
    created: Date;
    updated: Date;
};

export type importEvent = {
  name: string;
  slug: string;
  description?: string;
}

export function eventsMapper(input: unknown): Event | null {
  const potentialEvent = input as Partial<Event> | null;

  if (
    !potentialEvent ||
    !potentialEvent.id ||
    !potentialEvent.name ||
    !potentialEvent.slug ||
    !potentialEvent.description ||
    !potentialEvent.created ||
    !potentialEvent.updated 
  ) {
    return null;
  }

  const Event: Event = {
    id: potentialEvent.id,
    name: potentialEvent.name,
    slug: potentialEvent.slug,
    description: potentialEvent.description,
    created: new Date(potentialEvent.created),
    updated: new Date(potentialEvent.updated),
    
  };

  return Event;
}

// User
export type User = {
  id?: number;
  name: string;
  username: string;
  password?: string;
  admin: Boolean;
};

export type UsersInsert = {
  name: string;
  username: string;
  password: string;
}

export function userMapper(input: unknown): User | null {
  const potentialUser = input as Partial<User> | null;
  if (
    !potentialUser ||
    !potentialUser.id ||
    !potentialUser.name ||
    !potentialUser.username ||
    !potentialUser.password ||
    !potentialUser.admin 
  ) {
    return null;
  }
  const user: User = {
    id: potentialUser.id,
    name: potentialUser.name,
    username: potentialUser.username,
    password: potentialUser.password,
    admin: potentialUser.admin,
  };
  return user;
}

// Registrations
export type Regi = {
  id: number;
  name: string;
  comment: string;
  username: string;
  event: string;
  created: Date;
};

export type importRegi = {
name: string;
description?: string;
}

export function RegisMapper(input: unknown): Regi | null {
const potentialRegi = input as Partial<Regi> | null;

if (
  !potentialRegi ||
  !potentialRegi.id ||
  !potentialRegi.name ||
  !potentialRegi.comment ||
  !potentialRegi.username ||
  !potentialRegi.event ||
  !potentialRegi.created 
) {
  return null;
}

const regi: Regi = {
  id: potentialRegi.id,
  name: potentialRegi.name,
  comment: potentialRegi.comment,
  username: potentialRegi.username,
  event: potentialRegi.event,
  created: new Date(potentialRegi.created),
  
};

return regi;
}