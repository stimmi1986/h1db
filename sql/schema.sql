
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
  password character varying(256) NOT NULL,
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
  name varchar(64) UNIQUE not null,
  url varchar(254) UNIQUE not null
);
CREATE TABLE public.eventImages(
  id SERIAL PRIMARY KEY,
  image INTEGER not null,
  event INTEGER not null,
  constraint pair UNIQUE(image,event),
  constraint event FOREIGN KEY (event) REFERENCES events (id) on delete cascade,
  constraint unique_image FOREIGN KEY (image) REFERENCES images (id) on delete cascade
);
