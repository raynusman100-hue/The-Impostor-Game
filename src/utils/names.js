export const FUNNY_NAMES = [
    "Shadow Stalker", "Silent Sneezer", "Doughnut Thief", "Banana Ninja",
    "Wobbly Wizard", "Grumpy Goblin", "Neon Nomad", "Spicy Squirrel",
    "Lazy Laser", "Disco Duck", "Caffeine Cat", "Marshmallow Man",
    "Pixel Pirate", "Velvet Viper", "Ginger Giant", "Sonic Sloth",
    "Turbo Turtle", "Bubbly Bear", "Golden Goose", "Cosmic Cow"
];

export const getRandomFunnyName = () => {
    return FUNNY_NAMES[Math.floor(Math.random() * FUNNY_NAMES.length)];
};
