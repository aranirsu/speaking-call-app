// Random name generator for anonymous users
const adjectives = [
  "Happy", "Clever", "Bright", "Swift", "Calm", "Bold", "Wise", "Kind",
  "Brave", "Cool", "Gentle", "Lucky", "Noble", "Proud", "Quick", "Smart",
  "Sunny", "Warm", "Witty", "Zen", "Eager", "Fresh", "Grand", "Jolly"
];

const nouns = [
  "Panda", "Eagle", "Tiger", "Dolphin", "Phoenix", "Dragon", "Falcon", "Lion",
  "Wolf", "Bear", "Hawk", "Fox", "Owl", "Deer", "Koala", "Penguin",
  "Rabbit", "Swan", "Turtle", "Whale", "Zebra", "Jaguar", "Leopard", "Panther"
];

export const generateRandomName = (): string => {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
};

export const getOrCreateUserName = (): string => {
  if (typeof window === "undefined") return generateRandomName();
  
  let name = localStorage.getItem("userName");
  if (!name) {
    name = generateRandomName();
    localStorage.setItem("userName", name);
  }
  return name;
};

export const regenerateUserName = (): string => {
  const name = generateRandomName();
  if (typeof window !== "undefined") {
    localStorage.setItem("userName", name);
  }
  return name;
};
