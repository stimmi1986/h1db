
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  slug VARCHAR(64) NOT NULL UNIQUE,
  description TEXT,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.users (
  id serial primary key,
  name character varying(64) NOT NULL,
  username character varying(64) NOT NULL UNIQUE,
  password character varying(256) NOT NULL,{"url":"https://i.guim.co.uk/img/media/7952718fda1246e1f3f7a88f20f4e4ea42921e2e/0_0_6000_4000/master/6000.jpg?width=620&quality=85&dpr=1&s=none", "name":"oat-milk"}
  admin BOOLEAN DEFAULT false
);

CREATE TABLE public.registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  comment TEXT,
  username character varying(64) NOT NULL,
  event INTEGER NOT NULL,
  created TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT event FOREIGN KEY (event) REFERENCES events (id) on delete cascade,
  CONSTRAINT username FOREIGN KEY (username) REFERENCES users (username) on delete cascade,
  constraint uq_pair  UNIQUE(username,event)
);
CREATE TABLE public.images(
  id SERIAL primary KEY,
  name varchar(64) UNIQUE not null on delete cascade,
  url varchar(254) UNIQUE not null on delete cascade
);

CREATE TABLE public.eventImages(
  id SERIAL PRIMARY KEY,
  image INTEGER not null,
  event INTEGER not null,
  constraint pair UNIQUE(image,event),
  constraint event FOREIGN KEY (event) REFERENCES events (id) on delete cascade,
  constraint unique_image FOREIGN KEY (image) REFERENCES images (id) on delete cascade
);
