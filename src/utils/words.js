/**
 * Dictionary of words categorized for the game.
 * Translations are handled automatically by the API.
 */
export const wordCategories = {
    places: [
        // Cities
        { word: 'Paris', impostorHint: 'Famous City', hint: 'Home of the Iron Lady' },
        { word: 'London', impostorHint: 'Capital', hint: 'Mind the Gap' },
        { word: 'Tokyo', impostorHint: 'Asian Hub', hint: 'Neon lights & sushi' },
        { word: 'New York', impostorHint: 'Metropolis', hint: 'Concrete Jungle' },
        { word: 'Dubai', impostorHint: 'Modern City', hint: 'Luxury in the sand' },
        { word: 'Egypt', impostorHint: 'Ancient Land', hint: 'Pharaohs rested here' },

        // Buildings
        { word: 'School', impostorHint: 'Institution', hint: 'Bells & books' },
        { word: 'Library', impostorHint: 'Quiet Zone', hint: 'Whispers required' },
        { word: 'Hospital', impostorHint: 'Emergency', hint: 'Healers work here' },
        { word: 'Airport', impostorHint: 'Transit Hub', hint: 'Departures & Arrivals' },
        { word: 'Cinema', impostorHint: 'Entertainment', hint: 'Silver screen venue' },
        { word: 'Park', impostorHint: 'Public Space', hint: 'Urban nature' },
        { word: 'Gym', impostorHint: 'Fitness', hint: 'Lift heavy things' },
        { word: 'Restaurant', impostorHint: 'Dining', hint: 'Chef\'s domain' },
        { word: 'Hotel', impostorHint: 'Lodging', hint: 'Room service available' },
        { word: 'Stadium', impostorHint: 'Arena', hint: 'Roaring crowds' },
        { word: 'Museum', impostorHint: 'Culture', hint: 'Preserved history' },
        { word: 'Zoo', impostorHint: 'Attraction', hint: 'Wild captivity' },

        // Nature
        { word: 'Beach', impostorHint: 'Outdoors', hint: 'Waves meet land' },
        { word: 'Forest', impostorHint: 'Wilderness', hint: 'Canopy of green' },
        { word: 'Desert', impostorHint: 'Landscape', hint: 'Dry & barren' },
        { word: 'Ocean', impostorHint: 'Water Body', hint: 'Deep blue vastness' },
        { word: 'Island', impostorHint: 'Landmass', hint: 'Surrounded by waves' },
        { word: 'Mountain', impostorHint: 'Terrain', hint: 'Touching the clouds' },
        { word: 'Cave', impostorHint: 'Natural Formation', hint: 'Echoes in the dark' },
        { word: 'Waterfall', impostorHint: 'Water Feature', hint: 'Gravity & liquid' },
        { word: 'Lake', impostorHint: 'Inland Water', hint: 'Still waters' },

        // Landmarks
        { word: 'Moon', impostorHint: 'Celestial', hint: 'Night time glow' },
        { word: 'Mars', impostorHint: 'Planet', hint: 'Rusty neighbor' },
        { word: 'Mount Everest', impostorHint: 'Peak', hint: 'Top of the world' },
        { word: 'Antarctica', impostorHint: 'Region', hint: 'Penguin territory' },
        { word: 'Space Station', impostorHint: 'Spacecraft', hint: 'Orbiting laboratory' },
    ],
    food: [
        // Fruits
        { word: 'Apple', impostorHint: 'Produce', hint: 'Newton\'s inspiration' },
        { word: 'Banana', impostorHint: 'Produce', hint: 'Slippery peel' },
        { word: 'Orange', impostorHint: 'Citrus', hint: 'Vitamin C sphere' },
        { word: 'Grape', impostorHint: 'Fruit', hint: 'Wine origin' },
        { word: 'Strawberry', impostorHint: 'Berry', hint: 'Seeds on outside' },

        // Vegetables
        { word: 'Potato', impostorHint: 'Starch', hint: 'Mash, fry, or bake' },
        { word: 'Tomato', impostorHint: 'Ingredient', hint: 'Ketchup source' },
        { word: 'Onion', impostorHint: 'Vegetable', hint: 'Tear inducer' },
        { word: 'Garlic', impostorHint: 'Flavoring', hint: 'Wards off counts' },
        { word: 'Salad', impostorHint: 'Dish', hint: 'Leafy mix' },

        // Meals
        { word: 'Sushi', impostorHint: 'Cuisine', hint: 'Raw & rolled' },
        { word: 'Burger', impostorHint: 'Fast Food', hint: 'Patty between buns' },
        { word: 'Pasta', impostorHint: 'Italian', hint: 'Boiled dough shapes' },
        { word: 'Steak', impostorHint: 'Meat', hint: 'Rare or well done' },
        { word: 'Chicken', impostorHint: 'Poultry', hint: 'Tastes like everything' },
        { word: 'Rice', impostorHint: 'Grain', hint: 'Staple for billions' },
        { word: 'Sandwich', impostorHint: 'Lunch', hint: 'Stacked layers' },
        { word: 'Soup', impostorHint: 'Liquid', hint: 'Sip from bowl' },
        { word: 'Noodles', impostorHint: 'Pasta', hint: 'Slurping required' },

        // Desserts
        { word: 'Ice Cream', impostorHint: 'Frozen', hint: 'Scoopable treat' },
        { word: 'Chocolate', impostorHint: 'Sweet', hint: 'Cocoa delight' },
        { word: 'Donut', impostorHint: 'Pastry', hint: 'Glazed ring' },
        { word: 'Cake', impostorHint: 'Celebration', hint: 'Blow out candles' },
        { word: 'Cookie', impostorHint: 'Baked', hint: 'Dip in milk' },
        { word: 'Pie', impostorHint: 'Dessert', hint: 'Crust & filling' },

        // Drinks
        { word: 'Coffee', impostorHint: 'Beverage', hint: 'Morning fuel' },
        { word: 'Tea', impostorHint: 'Brew', hint: 'Steeped leaves' },
        { word: 'Juice', impostorHint: 'Drink', hint: 'Squeezed refreshment' },

        // Breakfast
        { word: 'Waffle', impostorHint: 'Breakfast', hint: 'Syrup trap grid' },
        { word: 'Pancake', impostorHint: 'Breakfast', hint: 'Flat stack' },
        { word: 'Egg', impostorHint: 'Protein', hint: 'Shell contained' },

        // Basics
        { word: 'Bread', impostorHint: 'Staple', hint: 'Sliced loaf' },
        { word: 'Cheese', impostorHint: 'Dairy', hint: 'Aged milk' },
        { word: 'Pickle', impostorHint: 'Preserve', hint: 'Brined cucumber' },
    ],
    movies: [
        // Superhero/Action Movies
        { word: 'Avengers', impostorHint: 'Franchise', hint: 'Heroes Assemble' },
        { word: 'Star Wars', impostorHint: 'Space Opera', hint: 'Use the Force' },
        { word: 'The Matrix', impostorHint: 'Sci-Fi Action', hint: 'There is no spoon' },
        { word: 'Inception', impostorHint: 'Mind-Bender', hint: 'Spinning top totem' },
        { word: 'The Dark Knight', impostorHint: 'Superhero', hint: 'Why so serious?' },
        { word: 'Spiderman', impostorHint: 'Marvel Hero', hint: 'Friendly neighborhood' },
        { word: 'Iron Man', impostorHint: 'Marvel', hint: 'Genius billionaire playboy' },
        { word: 'Batman', impostorHint: 'DC Hero', hint: 'Gotham\'s protector' },
        { word: 'Superman', impostorHint: 'DC', hint: 'Kryptonite weakness' },
        { word: 'Black Panther', impostorHint: 'Marvel', hint: 'Vibranium suit' },
        { word: 'Deadpool', impostorHint: 'Anti-Hero', hint: 'Breaking the 4th wall' },
        { word: 'Guardians of the Galaxy', impostorHint: 'Space Team', hint: 'I am Groot' },
        { word: 'Doctor Strange', impostorHint: 'Magic', hint: 'Time stone keeper' },
        { word: 'Thor', impostorHint: 'Avenger', hint: 'Worthy of the hammer' },
        { word: 'Captain America', impostorHint: 'Leader', hint: 'Shield of vibranium' },
        { word: 'Wonder Woman', impostorHint: 'Amazon', hint: 'Lasso of Truth' },
        { word: 'Aquaman', impostorHint: 'Atlantis', hint: 'Talks to fish' },
        { word: 'The Flash', impostorHint: 'Speedster', hint: 'Barry Allen' },
        { word: 'Dune', impostorHint: 'Sci-Fi Epic', hint: 'Spice must flow' },
        { word: 'Mad Max', impostorHint: 'Action', hint: 'Fury Road' },
        { word: 'Terminator', impostorHint: 'Robot', hint: 'Skynet\'s assassin' },
        { word: 'Alien', impostorHint: 'Space Horror', hint: 'In space, no one hears' },
        { word: 'Predator', impostorHint: 'Action Horror', hint: 'Thermal vision hunter' },
        { word: 'Transformers', impostorHint: 'Robots', hint: 'More than meets eye' },
        { word: 'Fast and Furious', impostorHint: 'Action', hint: 'Quarter mile family' },
        { word: 'Mission Impossible', impostorHint: 'Spy Thriller', hint: 'This message will destruct' },
        { word: 'James Bond', impostorHint: 'Spy', hint: 'Shaken, not stirred' },
        { word: 'John Wick', impostorHint: 'Action', hint: 'Don\'t touch his dog' },

        // Animated/Family Movies
        { word: 'Avatar', impostorHint: 'Blockbuster', hint: 'Pandora\'s blue natives' },
        { word: 'The Lion King', impostorHint: 'Disney', hint: 'Hakuna Matata' },
        { word: 'Frozen', impostorHint: 'Disney', hint: 'Ice queen sister' },
        { word: 'Toy Story', impostorHint: 'Pixar', hint: 'To infinity & beyond' },
        { word: 'Finding Nemo', impostorHint: 'Pixar', hint: 'P. Sherman, 42 Wallaby' },
        { word: 'Shrek', impostorHint: 'Dreamworks', hint: 'Layers like onions' },
        { word: 'Moana', impostorHint: 'Disney', hint: 'Restoring the heart' },
        { word: 'Encanto', impostorHint: 'Disney', hint: 'Mirabel\'s magic house' },

        // Classic/Drama Movies
        { word: 'Titanic', impostorHint: 'Romance', hint: 'Jack and Rose' },
        { word: 'Jurassic Park', impostorHint: 'Adventure', hint: 'Life finds a way' },
        { word: 'Harry Potter', impostorHint: 'Fantasy', hint: 'Platform 9 3/4' },
        { word: 'Lord of the Rings', impostorHint: 'High Fantasy', hint: 'Precious ring' },
        { word: 'The Godfather', impostorHint: 'Crime', hint: 'Offer he can\'t refuse' },
        { word: 'Forrest Gump', impostorHint: 'Drama', hint: 'Run, Forrest, Run' },
        { word: 'Pulp Fiction', impostorHint: 'Cult Classic', hint: 'Royale with Cheese' },
        { word: 'The Shawshank Redemption', impostorHint: 'Drama', hint: 'Hope is a good thing' },
        { word: 'Gladiator', impostorHint: 'Historical', hint: 'Are you not entertained?' },
        { word: 'Jaws', impostorHint: 'Creaure Feature', hint: 'Wait for the beat...' },
        { word: 'E.T.', impostorHint: 'Sci-Fi', hint: 'Glowing finger' },
        { word: 'Back to the Future', impostorHint: 'Sci-Fi', hint: '88 miles per hour' },
        { word: 'Rocky', impostorHint: 'Sports', hint: 'Eye of the Tiger' },
        { word: 'Interstellar', impostorHint: 'Sci-Fi', hint: 'Murph & the bookshelf' },
        { word: 'Oppenheimer', impostorHint: 'Biopic', hint: 'Trinity Test' },
        { word: 'Barbie', impostorHint: 'Comedy', hint: 'Hi Ken!' },
        { word: 'Top Gun', impostorHint: 'Action', hint: 'Highway to the Danger Zone' },
        { word: 'The Hunger Games', impostorHint: 'Dystopian', hint: 'I volunteer as tribute' },
        { word: 'Twilight', impostorHint: 'Romance', hint: 'Sparkling skin' },
        { word: 'Pirates of the Caribbean', impostorHint: 'Adventure', hint: 'Black Pearl captain' },

        // TV Series
        { word: 'Game of Thrones', impostorHint: 'Fantasy TV', hint: 'Winter is Coming' },
        { word: 'Friends', impostorHint: 'Sitcom', hint: 'Central Perk crew' },
        { word: 'Breaking Bad', impostorHint: 'Crime Drama', hint: 'I am the one who knocks' },
        { word: 'Stranger Things', impostorHint: 'Sci-Fi TV', hint: 'Running up that hill' },
        { word: 'The Office', impostorHint: 'Sitcom', hint: 'Dunder Mifflin paper' },
        { word: 'Squid Game', impostorHint: 'Thriller', hint: 'Red Light, Green Light' },
        { word: 'Wednesday', impostorHint: 'Fantasy TV', hint: 'Nevermore Academy' },
        { word: 'The Mandalorian', impostorHint: 'Sci-Fi TV', hint: 'Baby Yoda protector' },
    ],
    games: [
        // Battle Royale/Shooter
        { word: 'Fortnite', impostorHint: 'Battle Royale', hint: 'Building & Flossing' },
        { word: 'Among Us', impostorHint: 'Social Deduction', hint: 'Sus vents' },
        { word: 'Call of Duty', impostorHint: 'FPS', hint: 'Modern Warfare' },
        { word: 'Valorant', impostorHint: 'Tactical Shooter', hint: 'Spike plant' },
        { word: 'Counter-Strike', impostorHint: 'Shooter', hint: 'Bomb has been planted' },
        { word: 'Overwatch', impostorHint: 'Team Shooter', hint: 'Push the payload' },
        { word: 'Apex Legends', impostorHint: 'Battle Royale', hint: 'Slide jumping legends' },
        { word: 'PUBG', impostorHint: 'Survival', hint: 'Winner Winner Chicken Dinner' },
        { word: 'Halo', impostorHint: 'Sci-Fi Shooter', hint: 'Cortana & Chief' },

        // Sandbox/Adventure
        { word: 'Minecraft', impostorHint: 'Sandbox', hint: 'Punching trees' },
        { word: 'Roblox', impostorHint: 'Platform', hint: 'Oof sound' },
        { word: 'Grand Theft Auto', impostorHint: 'Open World', hint: 'Five stars wanted' },
        { word: 'The Sims', impostorHint: 'Simulation', hint: 'Speaking Simlish' },
        { word: 'Animal Crossing', impostorHint: 'Social Sim', hint: 'Debt to a raccoon' },
        { word: 'Stardew Valley', impostorHint: 'Farming', hint: 'Grandpa\'s farm' },
        { word: 'Terraria', impostorHint: '2D Adventure', hint: '2D Minecraft' },
        { word: 'Red Dead Redemption', impostorHint: 'Western', hint: 'Outlaws & horses' },

        // Classic/Retro
        { word: 'Pokémon', impostorHint: 'RPG Franchise', hint: 'Evolution & training' },
        { word: 'Mario', impostorHint: 'Platformer', hint: 'Saving Peach' },
        { word: 'Zelda', impostorHint: 'Adventure', hint: 'Master Sword wielder' },
        { word: 'Sonic', impostorHint: 'Platformer', hint: 'Gotta go fast' },
        { word: 'Pac-Man', impostorHint: 'Arcade', hint: 'Waka waka waka' },
        { word: 'Tetris', impostorHint: 'Puzzle', hint: 'Clearing lines' },

        // MOBA/Strategy
        { word: 'League of Legends', impostorHint: 'MOBA', hint: 'Summoner\'s Rift' },
        { word: 'Dota', impostorHint: 'MOBA', hint: 'The International' },
        { word: 'Rocket League', impostorHint: 'Sports', hint: 'Flying car goals' },
        { word: 'FIFA', impostorHint: 'Sports Sim', hint: 'Generic football game' },

        // Mobile/Casual
        { word: 'Fall Guys', impostorHint: 'Party Game', hint: 'Stumbling beans' },
        { word: 'Candy Crush', impostorHint: 'Mobile Puzzle', hint: 'Sweet matching' },
        { word: 'Angry Birds', impostorHint: 'Mobile', hint: 'Destructive sling' },
        { word: 'Clash of Clans', impostorHint: 'Strategy', hint: 'Barbarian King' },
        { word: 'Clash Royale', impostorHint: 'Card Battler', hint: 'Towers & elixir' },
        { word: 'Subway Surfers', impostorHint: 'Runner', hint: 'Running on rails' },
        { word: 'Temple Run', impostorHint: 'Runner', hint: 'Chased by monkeys' },
        { word: 'Fruit Ninja', impostorHint: 'Arcade', hint: 'Finger sword' },

        // RPG/Action
        { word: 'Undertale', impostorHint: 'Indie RPG', hint: 'Determination' },
        { word: 'Cuphead', impostorHint: 'Run & Gun', hint: 'Don\'t deal with the Devil' },
        { word: 'Hollow Knight', impostorHint: 'Metroidvania', hint: 'Hallownest explorer' },
        { word: 'Celeste', impostorHint: 'Platformer', hint: 'Climbing Celeste' },
        { word: 'Hades', impostorHint: 'Roguelite', hint: 'Escaping father' },
        { word: 'Dark Souls', impostorHint: 'Action RPG', hint: 'Bonfire rest' },
        { word: 'Elden Ring', impostorHint: 'Open World', hint: 'Maidenless Tarnished' },
        { word: 'Skyrim', impostorHint: 'RPG', hint: 'Arrow to the knee' },
        { word: 'Fallout', impostorHint: 'RPG', hint: 'Vault Dweller' },
        { word: 'The Witcher', impostorHint: 'Fantasy RPG', hint: 'Toss a coin' },
        { word: 'Assassins Creed', impostorHint: 'Action', hint: 'Hidden blade' },
        { word: 'God of War', impostorHint: 'Action', hint: 'Boy!' },
        { word: 'The Last of Us', impostorHint: 'Survival', hint: 'Clickers & cordyceps' },
        { word: 'Uncharted', impostorHint: 'Adventure', hint: 'Drake\'s fortune' },
        { word: 'Spider-Man', impostorHint: 'Action', hint: 'NYC swinger' },
        { word: 'Batman Arkham', impostorHint: 'Action', hint: 'Detective mode' },
        { word: 'Genshin Impact', impostorHint: 'Gacha', hint: 'Emergency food (Paimon)' },
        { word: 'Honkai Star Rail', impostorHint: 'Space RPG', hint: 'Astral Express' },
        { word: 'Final Fantasy', impostorHint: 'JRPG', hint: 'Chocobos & crystals' },
        { word: 'Dragon Quest', impostorHint: 'JRPG', hint: 'Slime mascot' },
        { word: 'Persona', impostorHint: 'JRPG', hint: 'High school & shadows' },
        { word: 'Metal Gear Solid', impostorHint: 'Stealth', hint: 'Snake? Snake!' },

        // Fighting
        { word: 'Mortal Kombat', impostorHint: 'Fighting', hint: 'Fatality' },
        { word: 'Street Fighter', impostorHint: 'Fighting', hint: 'Sonic Boom' },
        { word: 'Super Smash Bros', impostorHint: 'Platform Fighter', hint: 'Everyone is here' },
        { word: 'Tekken', impostorHint: 'Fighting', hint: 'Thrown into volcano' },

        // Horror
        { word: 'Resident Evil', impostorHint: 'Survival Horror', hint: 'Umbrella Corporation' },
        { word: 'Silent Hill', impostorHint: 'Psychological Horror', hint: 'Pyramid Head' },
        { word: 'Five Nights at Freddys', impostorHint: 'Indie Horror', hint: 'Survive until 6AM' },
    ],
    objects: [
        // Furniture
        { word: 'Chair', impostorHint: 'Furniture', hint: 'You sit on it' },
        { word: 'Table', impostorHint: 'Furniture', hint: 'Furniture with legs' },
        { word: 'Bed', impostorHint: 'Furniture', hint: 'Sleep on this' },
        { word: 'Mirror', impostorHint: 'Furniture', hint: 'Reflects image' },

        // Wearables
        { word: 'Shoe', impostorHint: 'Wearables', hint: 'Worn on feet' },
        { word: 'Watch', impostorHint: 'Wearables', hint: 'Wear on wrist' },
        { word: 'Glasses', impostorHint: 'Wearables', hint: 'Helps vision' },
        { word: 'Hat', impostorHint: 'Wearables', hint: 'Worn on head' },

        // Kitchen
        { word: 'Knife', impostorHint: 'Kitchen', hint: 'Used to cut' },
        { word: 'Spoon', impostorHint: 'Kitchen', hint: 'Used to eat soup' },
        { word: 'Fork', impostorHint: 'Kitchen', hint: 'Used to pierce food' },
        { word: 'Plate', impostorHint: 'Kitchen', hint: 'Eat off this' },
        { word: 'Cup', impostorHint: 'Kitchen', hint: 'Drink from this' },
        { word: 'Bottle', impostorHint: 'Kitchen', hint: 'Holds liquid' },

        // Tech
        { word: 'Phone', impostorHint: 'Tech', hint: 'Used for calling' },
        { word: 'Laptop', impostorHint: 'Tech', hint: 'Portable PC' },
        { word: 'Camera', impostorHint: 'Tech', hint: 'Takes photos' },

        // Tools
        { word: 'Key', impostorHint: 'Tools', hint: 'Unlocks doors' },
        { word: 'Pen', impostorHint: 'Tools', hint: 'Writes with ink' },
        { word: 'Paper', impostorHint: 'Tools', hint: 'Write on this' },
        { word: 'Umbrella', impostorHint: 'Tools', hint: 'Protect from rain' },
        { word: 'Scissors', impostorHint: 'Tools', hint: 'Cutting tool' },
        { word: 'Needle', impostorHint: 'Tools', hint: 'Sewing tool' },
        { word: 'Thread', impostorHint: 'Tools', hint: 'For sewing' },

        // Personal
        { word: 'Bag', impostorHint: 'Personal', hint: 'Carry things in it' },
        { word: 'Soap', impostorHint: 'Personal', hint: 'Cleans body' },
        { word: 'Towel', impostorHint: 'Personal', hint: 'Dries you off' },
        { word: 'Comb', impostorHint: 'Personal', hint: 'Styles hair' },
        { word: 'Wallet', impostorHint: 'Personal', hint: 'Holds money' },
        { word: 'Backpack', impostorHint: 'Personal', hint: 'Carries books' },

        // Clothing
        { word: 'Button', impostorHint: 'Clothing', hint: 'Fastens clothes' },
        { word: 'Zipper', impostorHint: 'Clothing', hint: 'Quick fastener' },

        // Vehicles
        { word: 'Car', impostorHint: 'Vehicles', hint: 'Road vehicle' },
    ],
    trends: [
        // Tech Trends
        { word: 'AI', impostorHint: 'Tech', hint: 'Generative brains' },
        { word: 'Crypto', impostorHint: 'Finance', hint: 'Blockchain money' },
        { word: 'NFT', impostorHint: 'Digital', hint: 'Expensive JPEG' },
        { word: 'Metaverse', impostorHint: 'Virtual Reality', hint: 'Digital avatar world' },
        { word: 'Drone', impostorHint: 'Robotics', hint: 'Flying camera' },
        { word: 'Electric Car', impostorHint: 'Automotive', hint: 'Battery on wheels' },
        { word: 'Smartwatch', impostorHint: 'Gadget', hint: 'Wrist computer' },
        { word: 'Cloud', impostorHint: 'Storage', hint: 'Data in the sky' },
        { word: 'Wi-Fi', impostorHint: 'Network', hint: 'Invisible internet' },

        // Social Media
        { word: 'Influencer', impostorHint: 'Career', hint: 'Paid to post' },
        { word: 'Streaming', impostorHint: 'Entertainment', hint: 'Live broadcast' },
        { word: 'Meme', impostorHint: 'Humor', hint: 'Viral inside joke' },
        { word: 'Viral', impostorHint: 'Popularity', hint: 'Spreading purely' },
        { word: 'Selfie', impostorHint: 'Photography', hint: 'Front camera shot' },
        { word: 'Hashtag', impostorHint: 'Tagging', hint: 'Pound sign topic' },
        { word: 'Podcast', impostorHint: 'Audio', hint: 'Radio on demand' },
        { word: 'Vlog', impostorHint: 'Video', hint: 'Video diary' },
        { word: 'Filter', impostorHint: 'Editing', hint: 'Face alteration' },
        { word: 'Reel', impostorHint: 'Video Format', hint: 'Short looping clip' },
        { word: 'Challenge', impostorHint: 'Activity', hint: 'Viral dare' },
        { word: 'Algorithm', impostorHint: 'Code', hint: 'Decides what you see' },
        { word: 'Troll', impostorHint: 'User', hint: 'Internet provoker' },

        // Digital Life
        { word: 'Remote Work', impostorHint: 'Lifestyle', hint: 'Zoom & sweatpants' },
        { word: 'Bot', impostorHint: 'Software', hint: 'Automated user' },
        { word: 'App', impostorHint: 'Software', hint: 'Tap to open' },
        { word: 'Emoji', impostorHint: 'Symbol', hint: 'Yellow faces' },
        { word: 'GIF', impostorHint: 'Format', hint: 'Looping image' },
        { word: 'Screenshot', impostorHint: 'Capture', hint: 'Display frozen' },
        { word: 'Notification', impostorHint: 'Alert', hint: 'Ping!' },
        { word: 'Download', impostorHint: 'Transfer', hint: 'Server to device' },
        { word: 'Upload', impostorHint: 'Transfer', hint: 'Device to server' },
        { word: 'Password', impostorHint: 'Security', hint: 'Starred text' },
    ],
    sport: [
        // Ball Sports
        { word: 'Soccer', impostorHint: 'Ball Sports', hint: 'Football (World)' },
        { word: 'Basketball', impostorHint: 'Ball Sports', hint: 'Hoops and dunking' },
        { word: 'Cricket', impostorHint: 'Ball Sports', hint: 'Bat and ball' },
        { word: 'Tennis', impostorHint: 'Ball Sports', hint: 'Racket and yellow ball' },
        { word: 'Golf', impostorHint: 'Ball Sports', hint: 'Clubs and holes' },
        { word: 'Volleyball', impostorHint: 'Ball Sports', hint: 'Net and spike' },
        { word: 'Baseball', impostorHint: 'Ball Sports', hint: 'Bat and diamond' },
        { word: 'Badminton', impostorHint: 'Ball Sports', hint: 'Shuttlecock' },
        { word: 'Table Tennis', impostorHint: 'Ball Sports', hint: 'Ping pong' },

        // Combat Sports
        { word: 'Boxing', impostorHint: 'Combat Sports', hint: 'Fighting with gloves' },
        { word: 'Wrestling', impostorHint: 'Combat Sports', hint: 'Grappling' },
        { word: 'Karate', impostorHint: 'Combat Sports', hint: 'Martial art' },

        // Water Sports
        { word: 'Swimming', impostorHint: 'Water Sports', hint: 'Water racing' },
        { word: 'Surfing', impostorHint: 'Water Sports', hint: 'Riding waves' },

        // Winter Sports
        { word: 'Skiing', impostorHint: 'Winter Sports', hint: 'Snow sliding' },
        { word: 'Skating', impostorHint: 'Winter Sports', hint: 'Ice or wheels' },
        { word: 'Hockey', impostorHint: 'Winter Sports', hint: 'Puck and stick' },

        // Athletics
        { word: 'Running', impostorHint: 'Athletics', hint: 'Track usually' },
        { word: 'Marathon', impostorHint: 'Athletics', hint: 'Long race' },
        { word: 'Sprinting', impostorHint: 'Athletics', hint: 'Fast race' },
        { word: 'Cycling', impostorHint: 'Athletics', hint: 'Bike racing' },

        // Other Sports
        { word: 'Yoga', impostorHint: 'Other Sports', hint: 'Stretching poses' },
        { word: 'Gymnastics', impostorHint: 'Other Sports', hint: 'Flips and balance' },
        { word: 'Rugby', impostorHint: 'Other Sports', hint: 'Oval ball contact' },

        // Sports Items
        { word: 'Medal', impostorHint: 'Sports Items', hint: 'Gold, Silver, Bronze' },
        { word: 'Trophy', impostorHint: 'Sports Items', hint: 'Winner prize' },
        { word: 'Stadium', impostorHint: 'Sports Items', hint: 'Sports venue' },
        { word: 'Coach', impostorHint: 'Sports Items', hint: 'Team trainer' },
        { word: 'Referee', impostorHint: 'Sports Items', hint: 'Game judge' },
        { word: 'Whistle', impostorHint: 'Sports Items', hint: 'Referee tool' },
        { word: 'Goal', impostorHint: 'Sports Items', hint: 'Score point' },
        { word: 'Team', impostorHint: 'Sports Items', hint: 'Group of players' },
    ],
    dailyLife: [
        // Transport
        { word: 'Traffic', impostorHint: 'Transport', hint: 'Cars on road' },
        { word: 'Bus', impostorHint: 'Transport', hint: 'Public transport' },
        { word: 'Train', impostorHint: 'Transport', hint: 'Rail transport' },
        { word: 'Walking', impostorHint: 'Transport', hint: 'Moving on legs' },

        // Daily Tasks
        { word: 'Shopping', impostorHint: 'Daily Tasks', hint: 'Buying things' },
        { word: 'Cooking', impostorHint: 'Daily Tasks', hint: 'Making food' },
        { word: 'Cleaning', impostorHint: 'Daily Tasks', hint: 'Tidying up' },
        { word: 'Shower', impostorHint: 'Daily Tasks', hint: 'Bathing' },

        // Work Life
        { word: 'Meeting', impostorHint: 'Work Life', hint: 'Gathering at work' },
        { word: 'Email', impostorHint: 'Work Life', hint: 'Digital letter' },
        { word: 'Salary', impostorHint: 'Work Life', hint: 'Pay for work' },
        { word: 'Rent', impostorHint: 'Work Life', hint: 'Pay for house' },

        // Meals
        { word: 'Breakfast', impostorHint: 'Meals', hint: 'Morning meal' },
        { word: 'Lunch', impostorHint: 'Meals', hint: 'Midday meal' },
        { word: 'Dinner', impostorHint: 'Meals', hint: 'Evening meal' },

        // Activities
        { word: 'Sleeping', impostorHint: 'Activities', hint: 'Resting eyes' },
        { word: 'Talking', impostorHint: 'Activities', hint: 'Speaking' },
        { word: 'Listening', impostorHint: 'Activities', hint: 'Hearing' },
        { word: 'Reading', impostorHint: 'Activities', hint: 'Looking at text' },
        { word: 'Writing', impostorHint: 'Activities', hint: 'Pen on paper' },
        { word: 'Drawing', impostorHint: 'Activities', hint: 'Creating art' },

        // Events
        { word: 'Party', impostorHint: 'Events', hint: 'Celebration' },
        { word: 'Wedding', impostorHint: 'Events', hint: 'Marriage ceremony' },
        { word: 'Birthday', impostorHint: 'Events', hint: 'Age celebration' },

        // Time
        { word: 'Alarm', impostorHint: 'Time', hint: 'Wakes you up' },
        { word: 'Holiday', impostorHint: 'Time', hint: 'Day off' },
        { word: 'Vacation', impostorHint: 'Time', hint: 'Long break' },
        { word: 'Weekend', impostorHint: 'Time', hint: 'Saturday Sunday' },
        { word: 'Morning', impostorHint: 'Time', hint: 'Early day' },
        { word: 'Evening', impostorHint: 'Time', hint: 'Late day' },
        { word: 'Midnight', impostorHint: 'Time', hint: '12 AM' },
        { word: 'Noon', impostorHint: 'Time', hint: '12 PM' },
    ],
    things: [
        // Containers
        { word: 'Box', impostorHint: 'Storage', hint: 'Six-sided holder' },
        { word: 'Vase', impostorHint: 'Decoration', hint: 'Flower vessel' },
        { word: 'Pot', impostorHint: 'Kitchenware', hint: 'Stew boiler' },
        { word: 'Pan', impostorHint: 'Kitchenware', hint: 'Sizzle surface' },

        // Accessories
        { word: 'Ball', impostorHint: 'Toy', hint: 'Bounces or rolls' },
        { word: 'Ring', impostorHint: 'Jewelry', hint: 'Circle of commitment' },
        { word: 'Chain', impostorHint: 'Jewelry', hint: 'Metal links' },

        // Security
        { word: 'Lock', impostorHint: 'Security', hint: 'Needs a key' },
        { word: 'Key', impostorHint: 'Security', hint: 'Turns the tumbler' },

        // House Parts
        { word: 'Door', impostorHint: 'Entrance', hint: 'Slam or shut' },
        { word: 'Window', impostorHint: 'Opening', hint: 'Glass view' },
        { word: 'Wall', impostorHint: 'Structure', hint: 'Holds the roof' },
        { word: 'Floor', impostorHint: 'Surface', hint: 'Lava game base' },
        { word: 'Roof', impostorHint: 'Structure', hint: 'Rain shield' },

        // Home Items
        { word: 'Fan', impostorHint: 'Appliance', hint: 'Wind maker' },
        { word: 'Lamp', impostorHint: 'Lighting', hint: 'Bulb holder' },
        { word: 'Candle', impostorHint: 'Lighting', hint: 'Wax & wick' },
        { word: 'Pillow', impostorHint: 'Bedding', hint: 'Feather sack' },
        { word: 'Blanket', impostorHint: 'Bedding', hint: 'Warmth layer' },
        { word: 'Curtain', impostorHint: 'Decor', hint: 'Window blocker' },
        { word: 'Carpet', impostorHint: 'Decor', hint: 'Soft floor' },

        // Hygiene
        { word: 'Soap', impostorHint: 'Cleaning', hint: 'Slippery bubbler' },
        { word: 'Toothbrush', impostorHint: 'Hygiene', hint: 'Bristle stick' },

        // Tools
        { word: 'Ladder', impostorHint: 'Tool', hint: 'Steps up' },
        { word: 'Hammer', impostorHint: 'Tool', hint: 'Impact striker' },
        { word: 'Screw', impostorHint: 'Fastener', hint: 'Twist to tight' },
        { word: 'Nail', impostorHint: 'Fastener', hint: 'Hammer target' },
        { word: 'Drill', impostorHint: 'Tool', hint: 'Spinning bore' },
        { word: 'Paint', impostorHint: 'Material', hint: 'Color coat' },
        { word: 'Brush', impostorHint: 'Tool', hint: 'Bristled painter' },
        { word: 'Rope', impostorHint: 'Material', hint: 'Knotted strands' },
        { word: 'Tape', impostorHint: 'Material', hint: 'Sticky side down' },
    ],
    science: [
        // Physics
        { word: 'Atom', impostorHint: 'Particle', hint: 'Building block' },
        { word: 'Gravity', impostorHint: 'Force', hint: 'Falling apple' },
        { word: 'Laser', impostorHint: 'Light', hint: 'Coherent beam' },
        { word: 'Magnet', impostorHint: 'Physics', hint: 'North & South' },
        { word: 'Battery', impostorHint: 'Energy', hint: 'Portable charge' },

        // Space
        { word: 'Galaxy', impostorHint: 'Space', hint: 'Milky Way type' },
        { word: 'Planet', impostorHint: 'Space', hint: 'Wanderer star' },
        { word: 'Satellite', impostorHint: 'Space', hint: 'Artificial moon' },
        { word: 'Rocket', impostorHint: 'Transport', hint: 'Space elevator' },
        { word: 'Astronaut', impostorHint: 'Career', hint: 'Zero-G worker' },
        { word: 'Black Hole', impostorHint: 'Phenomenon', hint: 'Event horizon' },
        { word: 'Meteor', impostorHint: 'Space Rock', hint: 'Shooting star' },

        // Biology
        { word: 'DNA', impostorHint: 'Biology', hint: 'Double helix' },
        { word: 'Virus', impostorHint: 'Microbe', hint: 'Cell hijacker' },
        { word: 'Fossil', impostorHint: 'Geology', hint: 'Stone bone' },
        { word: 'Evolution', impostorHint: 'Biology', hint: 'Natural selection' },

        // Earth Science
        { word: 'Volcano', impostorHint: 'Geology', hint: 'Magma vents' },

        // Technology
        { word: 'Robot', impostorHint: 'Automaton', hint: 'Asimov\'s laws' },
        { word: 'Telescope', impostorHint: 'Instrument', hint: 'Star gazer' },
        { word: 'Microscope', impostorHint: 'Instrument', hint: 'Cell viewer' },

        // Lab
        { word: 'Laboratory', impostorHint: 'Facility', hint: 'White coats' },
        { word: 'Chemical', impostorHint: 'Substance', hint: 'Reaction agent' },
        { word: 'Beaker', impostorHint: 'Glassware', hint: 'Pouring lip' },
        { word: 'Formula', impostorHint: 'Math', hint: 'Recipe for answer' },
        { word: 'Experiment', impostorHint: 'Process', hint: 'Hypothesis test' },
    ],
    history: [
        // Ancient Egypt
        { word: 'Pyramid', impostorHint: 'Monument', hint: 'Triangle tomb' },
        { word: 'Pharaoh', impostorHint: 'Ruler', hint: 'God king' },
        { word: 'Mummy', impostorHint: 'Burial', hint: 'Wrapped remains' },

        // Warriors
        { word: 'Knight', impostorHint: 'Warrior', hint: 'Round Table' },
        { word: 'Viking', impostorHint: 'Warrior', hint: 'Valhalla seeker' },
        { word: 'Samurai', impostorHint: 'Warrior', hint: 'Katana wielder' },
        { word: 'Gladiator', impostorHint: 'Fighter', hint: 'Colosseum star' },

        // Medieval
        { word: 'Castle', impostorHint: 'Fortress', hint: 'Moat & drawbridge' },
        { word: 'Sword', impostorHint: 'Weapon', hint: 'Steel blade' },
        { word: 'Shield', impostorHint: 'Armor', hint: 'Blocker' },

        // Royalty
        { word: 'Crown', impostorHint: 'Regalia', hint: 'Head of gold' },
        { word: 'Throne', impostorHint: 'Furniture', hint: 'Seat of power' },
        { word: 'Empire', impostorHint: 'Nation', hint: 'Sun never sets' },

        // Events
        { word: 'War', impostorHint: 'Conflict', hint: 'Battle of nations' },
        { word: 'Peace', impostorHint: 'State', hint: 'No more fighting' },
        { word: 'Revolution', impostorHint: 'Event', hint: 'Overthrow' },
        { word: 'Discovery', impostorHint: 'Event', hint: 'New world found' },

        // Artifacts
        { word: 'Ancient', impostorHint: 'Era', hint: 'Dusty & old' },
        { word: 'Coin', impostorHint: 'Currency', hint: 'Heads or tails' },
        { word: 'Map', impostorHint: 'Tool', hint: 'X marks the spot' },
    ],
    mythology: [
        // Creatures
        { word: 'Dragon', impostorHint: 'Beast', hint: 'Hoards gold' },
        { word: 'Unicorn', impostorHint: 'Beast', hint: 'Rare horned horse' },
        { word: 'Mermaid', impostorHint: 'Legend', hint: 'Sings to sailors' },
        { word: 'Phoenix', impostorHint: 'Legend', hint: 'Rising from ash' },

        // Greek Gods
        { word: 'Zeus', impostorHint: 'God', hint: 'Thunderbolt hurler' },
        { word: 'Hercules', impostorHint: 'Hero', hint: '12 Labors' },
        { word: 'Medusa', impostorHint: 'Monster', hint: 'Stone gaze' },
        { word: 'Poseidon', impostorHint: 'God', hint: 'Trident wielder' },
        { word: 'Hades', impostorHint: 'God', hint: 'Ruler of souls' },

        // Norse
        { word: 'Thor', impostorHint: 'God', hint: 'Mjolnir owner' },

        // Monsters
        { word: 'Ghost', impostorHint: 'Spirit', hint: 'Transparent haunt' },
        { word: 'Vampire', impostorHint: 'Undead', hint: 'Sunlight allergy' },
        { word: 'Werewolf', impostorHint: 'Monster', hint: 'Full moon shapeshifter' },
        { word: 'Giant', impostorHint: 'Humanoid', hint: 'Beanstalk climber' },
        { word: 'Demon', impostorHint: 'Entity', hint: 'Possessive spirit' },

        // Magic
        { word: 'Wizard', impostorHint: 'User', hint: 'Wand waver' },
        { word: 'Witch', impostorHint: 'User', hint: 'Broom rider' },
        { word: 'Fairy', impostorHint: 'Folk', hint: 'Tooth collector' },
        { word: 'Elf', impostorHint: 'Folk', hint: 'Santa\'s helper' },
        { word: 'Angel', impostorHint: 'Divine', hint: 'Halo wearer' },
    ],
    nature: [
        // Flowers
        { word: 'Flower', impostorHint: 'Plant', hint: 'Blooms in spring' },
        { word: 'Rose', impostorHint: 'Flower', hint: 'Thorns & romance' },
        { word: 'Sunflower', impostorHint: 'Flower', hint: 'Sun seeker' },

        // Plants
        { word: 'Grass', impostorHint: 'Plant', hint: 'Lawn cover' },
        { word: 'Cactus', impostorHint: 'Plant', hint: 'Prickly pear source' },
        { word: 'Palm Tree', impostorHint: 'Tree', hint: 'Coconut dropper' },
        { word: 'Leaf', impostorHint: 'Part', hint: 'Photosynthesis panel' },
        { word: 'Root', impostorHint: 'Part', hint: 'Anchor in dirt' },
        { word: 'Seed', impostorHint: 'Part', hint: 'Life capsule' },
        { word: 'Soil', impostorHint: 'Element', hint: 'Earth dirt' },
        { word: 'Mushroom', impostorHint: 'Fungi', hint: 'Spore bearer' },
        { word: 'Bamboo', impostorHint: 'Plant', hint: 'Panda snack' },
        { word: 'Vine', impostorHint: 'Plant', hint: 'Tarzan\'s swing' },

        // Forests
        { word: 'Forest', impostorHint: 'Biome', hint: 'Wooded land' },
        { word: 'Jungle', impostorHint: 'Biome', hint: 'Dense canopy' },
        { word: 'Rainforest', impostorHint: 'Biome', hint: 'Tropical wet' },

        // Water
        { word: 'River', impostorHint: 'Water', hint: 'Flowing downstream' },
        { word: 'Ocean', impostorHint: 'Water', hint: 'Salt & tides' },
        { word: 'Lake', impostorHint: 'Water', hint: 'Still inland body' },
        { word: 'Pond', impostorHint: 'Water', hint: 'Small frog home' },
        { word: 'Swamp', impostorHint: 'Wetland', hint: 'Murky waters' },

        // Landforms
        { word: 'Desert', impostorHint: 'Biome', hint: 'Oasis seeker' },
        { word: 'Mountain', impostorHint: 'Landform', hint: 'Snow capped' },
        { word: 'Valley', impostorHint: 'Landform', hint: 'Between peaks' },
        { word: 'Canyon', impostorHint: 'Landform', hint: 'River carved' },
        { word: 'Cliff', impostorHint: 'Landform', hint: 'Steep edge' },
        { word: 'Cave', impostorHint: 'Landform', hint: 'Bat home' },
        { word: 'Beach', impostorHint: 'Shore', hint: 'Tide line' },
        { word: 'Island', impostorHint: 'Land', hint: 'Isolated land' },
        { word: 'Volcano', impostorHint: 'Landform', hint: 'Dormant or active' },
    ],
    tech: [
        // Computing
        { word: 'Robot', impostorHint: 'Machine', hint: 'Automated labor' },
        { word: 'Computer', impostorHint: 'Device', hint: 'Silicon processor' },
        { word: 'Internet', impostorHint: 'Network', hint: 'Global web' },
        { word: 'Software', impostorHint: 'Code', hint: 'Virtual instructions' },
        { word: 'Hardware', impostorHint: 'Components', hint: 'Physical tech' },
        { word: 'Server', impostorHint: 'Infrastructure', hint: 'Data host' },
        { word: 'Cloud', impostorHint: 'Storage', hint: 'Remote drive' },
        { word: 'Database', impostorHint: 'Organization', hint: 'SQL or NoSQL' },

        // Peripherals
        { word: 'Keyboard', impostorHint: 'Input', hint: 'QWERTY board' },
        { word: 'Mouse', impostorHint: 'Input', hint: 'Scroll wheel' },
        { word: 'Screen', impostorHint: 'Output', hint: 'Pixel display' },
        { word: 'Headphones', impostorHint: 'Audio', hint: 'Noise cancelling' },
        { word: 'Microphone', impostorHint: 'Audio', hint: 'Voice capture' },

        // Power & Connectivity
        { word: 'Battery', impostorHint: 'Power', hint: 'Lithium Ion' },
        { word: 'Charger', impostorHint: 'Power', hint: 'Wall plug' },
        { word: 'Cable', impostorHint: 'Connection', hint: 'Fiber optic' },
        { word: 'Wifi', impostorHint: 'Connection', hint: 'Router signal' },
        { word: 'Bluetooth', impostorHint: 'Connection', hint: 'Blue tooth icon' },

        // Security
        { word: 'Hacker', impostorHint: 'Threat', hint: 'Black hat' },
        { word: 'Virus', impostorHint: 'Malware', hint: 'Trojan horse' },
        { word: 'Firewall', impostorHint: 'Security', hint: 'Packet filter' },
        { word: 'Encryption', impostorHint: 'Security', hint: 'Cipher text' },
        { word: 'Password', impostorHint: 'Security', hint: '123456 (don\'t use)' },

        // Communication
        { word: 'Email', impostorHint: 'Comm', hint: 'Inbox zero' },
        { word: 'Chat', impostorHint: 'Comm', hint: 'Instant message' },

        // Gaming
        { word: 'Video Game', impostorHint: 'Entertainment', hint: 'Interactive media' },
        { word: 'Console', impostorHint: 'Hardware', hint: 'Xbox or PS' },
        { word: 'Controller', impostorHint: 'Input', hint: 'Joystick & buttons' },

        // Display
        { word: 'Pixel', impostorHint: 'Unit', hint: 'Picture element' },
        { word: 'Bug', impostorHint: 'Error', hint: 'Feature not bug' },
    ],
    fashion: [
        // Tops
        { word: 'Dress', impostorHint: 'Outfit', hint: 'Gown or sundress' },
        { word: 'Shirt', impostorHint: 'Top', hint: 'Collared or tee' },
        { word: 'Jacket', impostorHint: 'Outerwear', hint: 'Bomber or denim' },
        { word: 'Coat', impostorHint: 'Outerwear', hint: 'Trench or pea' },
        { word: 'Suit', impostorHint: 'Formal', hint: 'Tie required' },

        // Bottoms
        { word: 'Skirt', impostorHint: 'Bottom', hint: 'Pleated or pencil' },
        { word: 'Pants', impostorHint: 'Bottom', hint: 'Trousers' },
        { word: 'Jeans', impostorHint: 'Denim', hint: 'Blue & durable' },

        // Headwear
        { word: 'Hat', impostorHint: 'Accessory', hint: 'Fedora or cap' },
        { word: 'Cap', impostorHint: 'Accessory', hint: 'Baseball style' },

        // Accessories
        { word: 'Scarf', impostorHint: 'Winter', hint: 'Neck wrap' },
        { word: 'Gloves', impostorHint: 'Winter', hint: 'Finger warmers' },
        { word: 'Belt', impostorHint: 'Accessory', hint: 'Buckle up' },
        { word: 'Tie', impostorHint: 'Formal', hint: 'Windsor knot' },
        { word: 'Watch', impostorHint: 'Jewelry', hint: 'Timekeeper' },
        { word: 'Glasses', impostorHint: 'Vision', hint: 'Corrective lenses' },
        { word: 'Sunglasses', impostorHint: 'Vision', hint: 'UV protection' },

        // Footwear
        { word: 'Socks', impostorHint: 'Base', hint: 'Ankle or tube' },
        { word: 'Shoes', impostorHint: 'Footwear', hint: 'Soles & laces' },
        { word: 'Boots', impostorHint: 'Footwear', hint: 'Hiking or rain' },
        { word: 'Heels', impostorHint: 'Footwear', hint: 'Stilettos' },
        { word: 'Sneakers', impostorHint: 'Footwear', hint: 'Kicks' },

        // Jewelry
        { word: 'Ring', impostorHint: 'Jewelry', hint: 'Band of gold' },
        { word: 'Necklace', impostorHint: 'Jewelry', hint: 'Pendant holder' },
        { word: 'Earring', impostorHint: 'Jewelry', hint: 'Studs or hoops' },
        { word: 'Bracelet', impostorHint: 'Jewelry', hint: 'Bangle' },

        // Bags
        { word: 'Purse', impostorHint: 'Bag', hint: 'Clutch or tote' },
        { word: 'Wallet', impostorHint: 'Accessory', hint: 'Cash carrier' },

        // Beauty
        { word: 'Makeup', impostorHint: 'Cosmetic', hint: 'Foundation & rouge' },
        { word: 'Perfume', impostorHint: 'Fragrance', hint: 'Eau de toilette' },
    ],
    football: [
        // LEGENDS
        { word: 'Pelé', impostorHint: 'Legends', hint: 'Brazil Legend' },
        { word: 'Maradona', impostorHint: 'Legends', hint: 'Hand of God' },
        { word: 'Zidane', impostorHint: 'Legends', hint: 'Headbutt final' },
        { word: 'Ronaldinho', impostorHint: 'Legends', hint: 'Joga Bonito' },
        { word: 'Ronaldo Nazário', impostorHint: 'Legends', hint: 'R9 Phenomenon' },
        { word: 'Thierry Henry', impostorHint: 'Legends', hint: 'Arsenal King' },
        { word: 'Johan Cruyff', impostorHint: 'Legends', hint: 'Total Football' },
        { word: 'Paolo Maldini', impostorHint: 'Legends', hint: 'Milan Defender' },
        { word: 'Beckham', impostorHint: 'Legends', hint: 'Free kick master' },
        { word: 'Rooney', impostorHint: 'Legends', hint: 'Man Utd Legend' },
        { word: 'Gerrard', impostorHint: 'Legends', hint: 'Liverpool Captain' },
        { word: 'Lampard', impostorHint: 'Legends', hint: 'Chelsea Goalscorer' },
        { word: 'Scholes', impostorHint: 'Legends', hint: 'Ginger Prince' },
        { word: 'Kaka', impostorHint: 'Legends', hint: 'Last human Ballon d\'Or' },
        { word: 'Pirlo', impostorHint: 'Legends', hint: 'The Architect' },
        { word: 'Iniesta', impostorHint: 'Legends', hint: 'World Cup winner' },
        { word: 'Xavi', impostorHint: 'Legends', hint: 'Master passer' },
        { word: 'Buffon', impostorHint: 'Legends', hint: 'Italian Goalkeeper' },
        { word: 'Cannavaro', impostorHint: 'Legends', hint: 'Ballon d\'Or Defender' },
        { word: 'Totti', impostorHint: 'Legends', hint: 'Roma Prince' },
        { word: 'Zlatan', impostorHint: 'Legends', hint: 'Dare to Zlatan' },
        { word: 'Suarez', impostorHint: 'Legends', hint: 'Biter Striker' },
        { word: 'Bale', impostorHint: 'Legends', hint: 'Wales. Golf. Madrid.' },
        { word: 'Hazard', impostorHint: 'Legends', hint: 'Chelsea Chelsea Chelsea' },
        { word: 'Aguero', impostorHint: 'Legends', hint: 'City Title Winner' },

        // MODERN STARS
        { word: 'Haaland', impostorHint: 'Modern Stars', hint: 'Robot striker' },
        { word: 'Mbappé', impostorHint: 'Modern Stars', hint: 'French Speedster' },
        { word: 'Bellingham', impostorHint: 'Modern Stars', hint: 'Hey Jude' },
        { word: 'Vinicius Jr', impostorHint: 'Modern Stars', hint: 'Real Madrid Winger' },
        { word: 'De Bruyne', impostorHint: 'Modern Stars', hint: 'Man City Playmaker' },
        { word: 'Salah', impostorHint: 'Modern Stars', hint: 'Egyptian King' },
        { word: 'Lewandowski', impostorHint: 'Modern Stars', hint: 'Goal Machine' },
        { word: 'Neymar', impostorHint: 'Modern Stars', hint: 'Brazilian Skill' },
        { word: 'Modric', impostorHint: 'Modern Stars', hint: 'Croatian Magician' },
        { word: 'Harry Kane', impostorHint: 'Modern Stars', hint: 'Bayern Striker' },
        { word: 'Son Heung-min', impostorHint: 'Modern Stars', hint: 'Korean Star' },
        { word: 'Van Dijk', impostorHint: 'Modern Stars', hint: 'Liverpool Wall' },
        { word: 'Rashford', impostorHint: 'Modern Stars', hint: 'Man Utd Winger' },
        { word: 'Saka', impostorHint: 'Modern Stars', hint: 'Arsenal Starboy' },
        { word: 'Pedri', impostorHint: 'Modern Stars', hint: 'Barca Wonderkid' },
        { word: 'Lamine Yamal', impostorHint: 'Modern Stars', hint: 'Teenage Sensation' },
        { word: 'Rodri', impostorHint: 'Modern Stars', hint: 'City Midfielder' },
        { word: 'Foden', impostorHint: 'Modern Stars', hint: 'Stockport Iniesta' },
        { word: 'Gavi', impostorHint: 'Modern Stars', hint: 'Barca Young Star' },
        { word: 'Tchouameni', impostorHint: 'Modern Stars', hint: 'Real Madrid Midfielder' },

        // TEAMS
        { word: 'Real Madrid', impostorHint: 'Teams', hint: 'Los Blancos' },
        { word: 'Barcelona', impostorHint: 'Teams', hint: 'Camp Nou' },
        { word: 'Man Utd', impostorHint: 'Teams', hint: 'Red Devils' },
        { word: 'Liverpool', impostorHint: 'Teams', hint: 'You\'ll Never Walk Alone' },
        { word: 'Arsenal', impostorHint: 'Teams', hint: 'Gunners' },
        { word: 'Chelsea', impostorHint: 'Teams', hint: 'The Blues' },
        { word: 'Man City', impostorHint: 'Teams', hint: 'Citizens' },
        { word: 'Bayern Munich', impostorHint: 'Teams', hint: 'German Giants' },
        { word: 'Dortmund', impostorHint: 'Teams', hint: 'Yellow Wall' },
        { word: 'Juventus', impostorHint: 'Teams', hint: 'Old Lady' },
        { word: 'AC Milan', impostorHint: 'Teams', hint: 'Rossoneri' },
        { word: 'Inter Milan', impostorHint: 'Teams', hint: 'Nerazzurri' },
        { word: 'PSG', impostorHint: 'Teams', hint: 'Paris Team' },
        { word: 'Ajax', impostorHint: 'Teams', hint: 'Dutch Academy' },
        { word: 'Boca Juniors', impostorHint: 'Teams', hint: 'Argentina Blue/Gold' },
        { word: 'Flamengo', impostorHint: 'Teams', hint: 'Brazil Red/Black' },
        { word: 'Al Nassr', impostorHint: 'Teams', hint: 'CR7 Team' },
        { word: 'Inter Miami', impostorHint: 'Teams', hint: 'Messi Team' },
    ],
    basketball: [
        // LEGENDS
        { word: 'Michael Jordan', impostorHint: 'Legends', hint: 'GOAT' },
        { word: 'LeBron James', impostorHint: 'Legends', hint: 'King James' },
        { word: 'Kobe Bryant', impostorHint: 'Legends', hint: 'Black Mamba' },
        { word: 'Magic Johnson', impostorHint: 'Legends', hint: 'Showtime Lakers' },
        { word: 'Larry Bird', impostorHint: 'Legends', hint: 'Boston Legend' },
        { word: 'Shaquille O\'Neal', impostorHint: 'Legends', hint: 'Diesel' },
        { word: 'Tim Duncan', impostorHint: 'Legends', hint: 'Big Fundamental' },
        { word: 'Kareem Abdul-Jabbar', impostorHint: 'Legends', hint: 'Skyhook' },
        { word: 'Wilt Chamberlain', impostorHint: 'Legends', hint: '100 points' },
        { word: 'Bill Russell', impostorHint: 'Legends', hint: '11 rings' },
        { word: 'Allen Iverson', impostorHint: 'Legends', hint: 'The Answer' },
        { word: 'Dirk Nowitzki', impostorHint: 'Legends', hint: 'German Legend' },
        { word: 'Hakeem Olajuwon', impostorHint: 'Legends', hint: 'Dream Shake' },
        { word: 'Charles Barkley', impostorHint: 'Legends', hint: 'Round Mound' },
        { word: 'Scottie Pippen', impostorHint: 'Legends', hint: 'Jordan\'s Partner' },

        // MODERN STARS
        { word: 'Stephen Curry', impostorHint: 'Modern Stars', hint: 'Chef Curry' },
        { word: 'Kevin Durant', impostorHint: 'Modern Stars', hint: 'Slim Reaper' },
        { word: 'Giannis', impostorHint: 'Modern Stars', hint: 'Greek Freak' },
        { word: 'Luka Doncic', impostorHint: 'Modern Stars', hint: 'Slovenian Wonder' },
        { word: 'Nikola Jokic', impostorHint: 'Modern Stars', hint: 'Joker' },
        { word: 'Joel Embiid', impostorHint: 'Modern Stars', hint: 'The Process' },
        { word: 'Jayson Tatum', impostorHint: 'Modern Stars', hint: 'Celtics Star' },
        { word: 'Anthony Davis', impostorHint: 'Modern Stars', hint: 'The Brow' },
        { word: 'Damian Lillard', impostorHint: 'Modern Stars', hint: 'Dame Time' },
        { word: 'Kawhi Leonard', impostorHint: 'Modern Stars', hint: 'The Claw' },
        { word: 'Jimmy Butler', impostorHint: 'Modern Stars', hint: 'Playoff Jimmy' },
        { word: 'Kyrie Irving', impostorHint: 'Modern Stars', hint: 'Uncle Drew' },
        { word: 'James Harden', impostorHint: 'Modern Stars', hint: 'The Beard' },
        { word: 'Russell Westbrook', impostorHint: 'Modern Stars', hint: 'Mr. Triple Double' },
        { word: 'Paul George', impostorHint: 'Modern Stars', hint: 'PG-13' },

        // TEAMS
        { word: 'Lakers', impostorHint: 'Teams', hint: 'Purple and Gold' },
        { word: 'Celtics', impostorHint: 'Teams', hint: 'Boston Green' },
        { word: 'Warriors', impostorHint: 'Teams', hint: 'Golden State' },
        { word: 'Bulls', impostorHint: 'Teams', hint: 'Chicago Dynasty' },
        { word: 'Heat', impostorHint: 'Teams', hint: 'Miami Vice' },
        { word: 'Spurs', impostorHint: 'Teams', hint: 'San Antonio' },
        { word: 'Knicks', impostorHint: 'Teams', hint: 'New York' },
        { word: 'Nets', impostorHint: 'Teams', hint: 'Brooklyn' },
        { word: 'Bucks', impostorHint: 'Teams', hint: 'Milwaukee' },
        { word: 'Mavericks', impostorHint: 'Teams', hint: 'Dallas' },
        { word: 'Nuggets', impostorHint: 'Teams', hint: 'Denver' },
        { word: 'Suns', impostorHint: 'Teams', hint: 'Phoenix' },
        { word: 'Sixers', impostorHint: 'Teams', hint: 'Philadelphia' },
        { word: 'Raptors', impostorHint: 'Teams', hint: 'Toronto' },
        { word: 'Clippers', impostorHint: 'Teams', hint: 'LA Clippers' },
    ],
    ballKnowledge: [
        // Combined from football and basketball
    ],
    kpop: [
        // Groups - Legends
        { word: 'BTS', impostorHint: 'Groups', hint: 'Bangtan Boys' },
        { word: 'BLACKPINK', impostorHint: 'Groups', hint: 'Pink Venom' },
        { word: 'BIGBANG', impostorHint: 'Groups', hint: 'Kings of K-pop' },
        { word: 'Girls\' Generation', impostorHint: 'Groups', hint: 'Nation\'s Girl Group' },
        { word: 'SHINee', impostorHint: 'Groups', hint: 'Princes of K-pop' },
        { word: 'TWICE', impostorHint: 'Groups', hint: 'One in a Million' },
        { word: 'EXO', impostorHint: 'Groups', hint: 'We Are One' },
        { word: 'SEVENTEEN', impostorHint: 'Groups', hint: '13 members' },

        // Groups - Current Gen
        { word: 'Stray Kids', impostorHint: 'Groups', hint: 'God\'s Menu' },
        { word: 'NewJeans', impostorHint: 'Groups', hint: 'Attention' },
        { word: 'aespa', impostorHint: 'Groups', hint: 'Next Level' },
        { word: 'ITZY', impostorHint: 'Groups', hint: 'Not Shy' },
        { word: 'Red Velvet', impostorHint: 'Groups', hint: 'Feel My Rhythm' },
        { word: 'NCT', impostorHint: 'Groups', hint: 'Neo Culture Technology' },
        { word: 'ENHYPEN', impostorHint: 'Groups', hint: 'Given-Taken' },
        { word: 'TXT', impostorHint: 'Groups', hint: 'Tomorrow X Together' },
        { word: 'LE SSERAFIM', impostorHint: 'Groups', hint: 'Fearless' },
        { word: 'IVE', impostorHint: 'Groups', hint: 'I Am' },
        { word: '(G)I-DLE', impostorHint: 'Groups', hint: 'Self-producing idols' },
        { word: 'BABYMONSTER', impostorHint: 'Groups', hint: 'YG New Gen' },
        { word: 'RIIZE', impostorHint: 'Groups', hint: 'Rising SM Group' },
        { word: 'ATEEZ', impostorHint: 'Groups', hint: 'Pirate Kings' },
        { word: 'TREASURE', impostorHint: 'Groups', hint: 'YG Boy Group' },
        { word: 'THE BOYZ', impostorHint: 'Groups', hint: 'Road to Kingdom' },

        // Soloists - BTS Members
        { word: 'Jungkook', impostorHint: 'Soloists', hint: 'Golden Maknae' },
        { word: 'Jimin', impostorHint: 'Soloists', hint: 'BTS Vocalist' },
        { word: 'V', impostorHint: 'Soloists', hint: 'Kim Taehyung' },
        { word: 'SUGA', impostorHint: 'Soloists', hint: 'BTS Producer' },
        { word: 'RM', impostorHint: 'Soloists', hint: 'BTS Leader' },

        // Soloists - BLACKPINK Members
        { word: 'Jennie', impostorHint: 'Soloists', hint: 'BLACKPINK Solo' },
        { word: 'Rosé', impostorHint: 'Soloists', hint: 'On The Ground' },
        { word: 'Lisa', impostorHint: 'Soloists', hint: 'Money rapper' },

        // Soloists - Legends & Icons
        { word: 'IU', impostorHint: 'Soloists', hint: 'Nation\'s Little Sister' },
        { word: 'PSY', impostorHint: 'Soloists', hint: 'Gangnam Style' },
        { word: 'G-Dragon', impostorHint: 'Soloists', hint: 'BIGBANG Leader' },
        { word: 'Taeyang', impostorHint: 'Soloists', hint: 'Eyes Nose Lips' },
        { word: 'Baekhyun', impostorHint: 'Soloists', hint: 'EXO Main Vocal' },
        { word: 'ZICO', impostorHint: 'Soloists', hint: 'Any Song' },
        { word: 'Jay Park', impostorHint: 'Soloists', hint: 'K-HipHop Icon' },
        { word: 'HyunA', impostorHint: 'Soloists', hint: 'Sexy Solo Queen' },
        { word: 'CL', impostorHint: 'Soloists', hint: '2NE1 Leader' },
        { word: 'Sunmi', impostorHint: 'Soloists', hint: 'Gashina' },
        { word: 'Taeyeon', impostorHint: 'Soloists', hint: 'SNSD Leader' },
        { word: 'Hwasa', impostorHint: 'Soloists', hint: 'MAMAMOO Solo' },

        // Songs - Iconic Classics
        { word: 'Gangnam Style', impostorHint: 'Songs', hint: 'Viral horse dance' },
        { word: 'Gee', impostorHint: 'Songs', hint: 'SNSD Legend' },
        { word: 'Growl', impostorHint: 'Songs', hint: 'EXO Breakthrough' },
        { word: 'Dynamite', impostorHint: 'Songs', hint: 'BTS English Hit' },
        { word: 'Butter', impostorHint: 'Songs', hint: 'Smooth like' },
        { word: 'Boy With Luv', impostorHint: 'Songs', hint: 'BTS Pop Era' },

        // Songs - Recent Hits
        { word: 'How You Like That', impostorHint: 'Songs', hint: 'BLACKPINK Hit' },
        { word: 'DDU-DU DDU-DU', impostorHint: 'Songs', hint: 'Gun sound song' },
        { word: 'Kill This Love', impostorHint: 'Songs', hint: 'BLACKPINK Anthem' },
        { word: 'Love Dive', impostorHint: 'Songs', hint: 'IVE Hit' },
        { word: 'OMG', impostorHint: 'Songs', hint: 'NewJeans Viral' },
        { word: 'Fancy', impostorHint: 'Songs', hint: 'TWICE Colorful' },
        { word: 'Cheer Up', impostorHint: 'Songs', hint: 'Shy shy shy' },
        { word: 'Love Scenario', impostorHint: 'Songs', hint: 'iKON Hit' },
        { word: 'Spring Day', impostorHint: 'Songs', hint: 'BTS Emotional' },
        { word: 'Fake Love', impostorHint: 'Songs', hint: 'BTS Dark' },

        // Terms - Fan Culture
        { word: 'Comeback', impostorHint: 'Terms', hint: 'New release' },
        { word: 'Bias', impostorHint: 'Terms', hint: 'Favorite member' },
        { word: 'Stan', impostorHint: 'Terms', hint: 'Dedicated fan' },
        { word: 'Ult Bias', impostorHint: 'Terms', hint: 'Top favorite' },
        { word: 'Maknae', impostorHint: 'Terms', hint: 'Youngest member' },
        { word: 'Visual', impostorHint: 'Terms', hint: 'Face of the group' },
        { word: 'Main Vocal', impostorHint: 'Terms', hint: 'Lead singer' },
        { word: 'Trainee', impostorHint: 'Terms', hint: 'Pre-debut idol' },

        // Terms - Industry
        { word: 'Aegyo', impostorHint: 'Terms', hint: 'Cute act' },
        { word: 'Daesang', impostorHint: 'Terms', hint: 'Grand Prize' },
        { word: 'All-Kill', impostorHint: 'Terms', hint: 'Chart domination' },
        { word: 'Sub-unit', impostorHint: 'Terms', hint: 'Group subdivision' },
        { word: 'Fancam', impostorHint: 'Terms', hint: 'Individual performance video' },
        { word: 'Lightstick', impostorHint: 'Terms', hint: 'Official fan light' },
        { word: 'Photocard', impostorHint: 'Terms', hint: 'Collectible card' },
    ],
    anime: [
        // Classic Anime
        { word: 'Naruto', impostorHint: 'Classic', hint: 'Believe it ninja' },
        { word: 'One Piece', impostorHint: 'Classic', hint: 'Pirate treasure hunt' },
        { word: 'Dragon Ball', impostorHint: 'Classic', hint: 'Goku Saiyan' },
        { word: 'Bleach', impostorHint: 'Classic', hint: 'Soul Reaper' },
        { word: 'Death Note', impostorHint: 'Classic', hint: 'Killer notebook' },
        { word: 'Fullmetal Alchemist', impostorHint: 'Classic', hint: 'Equivalent exchange' },
        { word: 'Attack on Titan', impostorHint: 'Classic', hint: 'Giant humanoids' },
        { word: 'My Hero Academia', impostorHint: 'Classic', hint: 'Plus Ultra' },
        { word: 'Demon Slayer', impostorHint: 'Classic', hint: 'Tanjiro sword' },
        { word: 'Sword Art Online', impostorHint: 'Classic', hint: 'VR game trap' },
        { word: 'Tokyo Ghoul', impostorHint: 'Classic', hint: 'Half human monster' },
        { word: 'Hunter x Hunter', impostorHint: 'Classic', hint: 'Gon adventure' },
        { word: 'Cowboy Bebop', impostorHint: 'Classic', hint: 'Space bounty hunters' },
        { word: 'Neon Genesis Evangelion', impostorHint: 'Classic', hint: 'Mecha psychological' },
        { word: 'Code Geass', impostorHint: 'Classic', hint: 'Lelouch rebellion' },
        { word: 'Steins Gate', impostorHint: 'Classic', hint: 'Time travel thriller' },
        { word: 'One Punch Man', impostorHint: 'Classic', hint: 'Bald hero' },
        { word: 'Mob Psycho 100', impostorHint: 'Classic', hint: 'Psychic boy' },
        { word: 'Jujutsu Kaisen', impostorHint: 'Classic', hint: 'Cursed energy' },
        { word: 'Chainsaw Man', impostorHint: 'Classic', hint: 'Devil hunter' },

        // Characters
        { word: 'Goku', impostorHint: 'Characters', hint: 'Kamehameha' },
        { word: 'Luffy', impostorHint: 'Characters', hint: 'Rubber pirate' },
        { word: 'Naruto Uzumaki', impostorHint: 'Characters', hint: 'Nine-tails host' },
        { word: 'Sasuke', impostorHint: 'Characters', hint: 'Uchiha avenger' },
        { word: 'Ichigo', impostorHint: 'Characters', hint: 'Orange hair soul reaper' },
        { word: 'Light Yagami', impostorHint: 'Characters', hint: 'Kira genius' },
        { word: 'L', impostorHint: 'Characters', hint: 'Detective sweet tooth' },
        { word: 'Eren Yeager', impostorHint: 'Characters', hint: 'Titan shifter' },
        { word: 'Mikasa', impostorHint: 'Characters', hint: 'Ackerman warrior' },
        { word: 'Levi', impostorHint: 'Characters', hint: 'Humanity\'s strongest' },
        { word: 'Deku', impostorHint: 'Characters', hint: 'Izuku Midoriya' },
        { word: 'All Might', impostorHint: 'Characters', hint: 'Symbol of Peace' },
        { word: 'Tanjiro', impostorHint: 'Characters', hint: 'Water breathing' },
        { word: 'Nezuko', impostorHint: 'Characters', hint: 'Bamboo demon' },
        { word: 'Gojo', impostorHint: 'Characters', hint: 'Six Eyes sorcerer' },
        { word: 'Saitama', impostorHint: 'Characters', hint: 'One punch bald' },
        { word: 'Edward Elric', impostorHint: 'Characters', hint: 'Short alchemist' },
        { word: 'Spike Spiegel', impostorHint: 'Characters', hint: 'Bebop bounty hunter' },
        { word: 'Vegeta', impostorHint: 'Characters', hint: 'Saiyan prince' },
        { word: 'Pikachu', impostorHint: 'Characters', hint: 'Electric mouse' },

        // Studio Ghibli
        { word: 'Spirited Away', impostorHint: 'Ghibli', hint: 'Bathhouse spirits' },
        { word: 'My Neighbor Totoro', impostorHint: 'Ghibli', hint: 'Forest spirit' },
        { word: 'Howls Moving Castle', impostorHint: 'Ghibli', hint: 'Walking house' },
        { word: 'Princess Mononoke', impostorHint: 'Ghibli', hint: 'Forest gods' },
        { word: 'Ponyo', impostorHint: 'Ghibli', hint: 'Fish girl' },
        { word: 'Kiki\'s Delivery Service', impostorHint: 'Ghibli', hint: 'Witch delivery' },

        // Terms
        { word: 'Otaku', impostorHint: 'Terms', hint: 'Anime fan' },
        { word: 'Manga', impostorHint: 'Terms', hint: 'Japanese comic' },
        { word: 'Kawaii', impostorHint: 'Terms', hint: 'Cute' },
        { word: 'Senpai', impostorHint: 'Terms', hint: 'Senior' },
        { word: 'Kohai', impostorHint: 'Terms', hint: 'Junior' },
        { word: 'Sensei', impostorHint: 'Terms', hint: 'Teacher' },
        { word: 'Waifu', impostorHint: 'Terms', hint: 'Favorite female character' },
        { word: 'Husbando', impostorHint: 'Terms', hint: 'Favorite male character' },
        { word: 'Nani', impostorHint: 'Terms', hint: 'What' },
        { word: 'Baka', impostorHint: 'Terms', hint: 'Idiot' },
    ],
    genZ: [
        // Classic Slang
        { word: 'Slay', impostorHint: 'Classic Slang', hint: 'Do something great' },
        { word: 'No Cap', impostorHint: 'Classic Slang', hint: 'No lie/for real' },
        { word: 'Bussin', impostorHint: 'Classic Slang', hint: 'Really good/delicious' },
        { word: 'Sheesh', impostorHint: 'Classic Slang', hint: 'Wow expression' },
        { word: 'Vibe Check', impostorHint: 'Classic Slang', hint: 'Mood assessment' },
        { word: 'Main Character', impostorHint: 'Classic Slang', hint: 'Living your best life' },
        { word: 'Rizz', impostorHint: 'Classic Slang', hint: 'Charisma/charm' },
        { word: 'Simp', impostorHint: 'Classic Slang', hint: 'Over-admirer' },
        { word: 'Stan', impostorHint: 'Classic Slang', hint: 'Super fan' },
        { word: 'Ghosting', impostorHint: 'Classic Slang', hint: 'Disappearing act' },
        { word: 'FOMO', impostorHint: 'Classic Slang', hint: 'Fear of missing out' },
        { word: 'Lowkey', impostorHint: 'Classic Slang', hint: 'Kind of/secretly' },
        { word: 'Highkey', impostorHint: 'Classic Slang', hint: 'Obviously/very' },
        { word: 'Bet', impostorHint: 'Classic Slang', hint: 'Okay/sure/agreed' },

        // Brainrot Core
        { word: 'Skibidi Toilet', impostorHint: 'Brainrot', hint: 'Viral meme series' },
        { word: 'Sigma', impostorHint: 'Brainrot', hint: 'Lone wolf mindset' },
        { word: 'Alpha', impostorHint: 'Brainrot', hint: 'Dominant personality' },
        { word: 'Beta', impostorHint: 'Brainrot', hint: 'Submissive type' },
        { word: 'Gyatt', impostorHint: 'Brainrot', hint: 'Exclamation of surprise' },
        { word: 'Ohio', impostorHint: 'Brainrot', hint: 'Weird/cursed place' },
        { word: 'Fanum Tax', impostorHint: 'Brainrot', hint: 'Taking someone\'s food' },
        { word: 'Griddy', impostorHint: 'Brainrot', hint: 'Victory dance' },
        { word: 'Mewing', impostorHint: 'Brainrot', hint: 'Jaw exercise trend' },
        { word: 'Mogging', impostorHint: 'Brainrot', hint: 'Outshining someone' },
        { word: 'Looksmaxxing', impostorHint: 'Brainrot', hint: 'Improving appearance' },
        { word: 'Goon Cave', impostorHint: 'Brainrot', hint: 'Personal space' },
        { word: 'NPC', impostorHint: 'Brainrot', hint: 'Non-playable character' },
        { word: 'Caught in 4K', impostorHint: 'Brainrot', hint: 'Caught red-handed' },
        { word: 'Ratio', impostorHint: 'Brainrot', hint: 'Getting more likes' },
        { word: 'L + Ratio', impostorHint: 'Brainrot', hint: 'Double insult' },
        { word: 'Touch Grass', impostorHint: 'Brainrot', hint: 'Go outside' },
        { word: 'Based', impostorHint: 'Brainrot', hint: 'Authentic/cool' },
        { word: 'Cringe', impostorHint: 'Brainrot', hint: 'Embarrassing' },
        { word: 'Mid', impostorHint: 'Brainrot', hint: 'Mediocre' },
        { word: 'W', impostorHint: 'Brainrot', hint: 'Win' },
        { word: 'L', impostorHint: 'Brainrot', hint: 'Loss' },
        { word: 'Ick', impostorHint: 'Brainrot', hint: 'Turn-off' },
        { word: 'Delulu', impostorHint: 'Brainrot', hint: 'Delusional' },
        { word: 'Yapping', impostorHint: 'Brainrot', hint: 'Talking too much' },
        { word: 'Cooked', impostorHint: 'Brainrot', hint: 'Done for/finished' },
        { word: 'It\'s Giving', impostorHint: 'Brainrot', hint: 'It seems like' },
        { word: 'Ate', impostorHint: 'Brainrot', hint: 'Did amazing' },
        { word: 'Devious Lick', impostorHint: 'Brainrot', hint: 'Stealing trend' },
        { word: 'Unhinged', impostorHint: 'Brainrot', hint: 'Wild/crazy' },
        { word: 'Snatched', impostorHint: 'Brainrot', hint: 'Looking good' },
        { word: 'Periodt', impostorHint: 'Brainrot', hint: 'End of discussion' },
        { word: 'Cheugy', impostorHint: 'Brainrot', hint: 'Out of style' },
        { word: 'Hits Different', impostorHint: 'Brainrot', hint: 'Feels special' },
        { word: 'Rent Free', impostorHint: 'Brainrot', hint: 'Can\'t stop thinking' },
        { word: 'Gatekeep', impostorHint: 'Brainrot', hint: 'Keep secret' },
        { word: 'Gaslight', impostorHint: 'Brainrot', hint: 'Manipulate' },
        { word: 'Girlboss', impostorHint: 'Brainrot', hint: 'Female entrepreneur' },
        { word: 'Slay Queen', impostorHint: 'Brainrot', hint: 'Confident woman' },
        { word: 'Toxic', impostorHint: 'Brainrot', hint: 'Harmful behavior' },
        { word: 'Red Flag', impostorHint: 'Brainrot', hint: 'Warning sign' },
        { word: 'Green Flag', impostorHint: 'Brainrot', hint: 'Good sign' },
        { word: 'Beige Flag', impostorHint: 'Brainrot', hint: 'Neutral quirk' },
        { word: 'Situationship', impostorHint: 'Brainrot', hint: 'Undefined relationship' },
        { word: 'Soft Launch', impostorHint: 'Brainrot', hint: 'Subtle reveal' },
        { word: 'Hard Launch', impostorHint: 'Brainrot', hint: 'Official announcement' },
    ],
    famousPeople: [
        // Innovators
        { word: 'Albert Einstein', impostorHint: 'Physicist', hint: 'E=mc^2' },
        { word: 'Steve Jobs', impostorHint: 'Tech Mogul', hint: 'Black turtleneck' },
        { word: 'Bill Gates', impostorHint: 'Tech Mogul', hint: 'Windows creator' },
        { word: 'Elon Musk', impostorHint: 'CEO', hint: 'Mars ambition' },
        { word: 'Walt Disney', impostorHint: 'Creator', hint: 'Happiest Place on Earth' },

        // Leaders
        { word: 'Barack Obama', impostorHint: 'President', hint: 'Yes We Can' },
        { word: 'Donald Trump', impostorHint: 'President', hint: 'Make America Great Again' },
        { word: 'Queen Elizabeth II', impostorHint: 'Monarch', hint: 'Longest reigning' },
        { word: 'Princess Diana', impostorHint: 'Royal', hint: 'People\'s Princess' },
        { word: 'Martin Luther King Jr', impostorHint: 'Activist', hint: 'I Have a Dream' },
        { word: 'Nelson Mandela', impostorHint: 'Activist', hint: 'Long Walk to Freedom' },
        { word: 'Mahatma Gandhi', impostorHint: 'Activist', hint: 'Peaceful resistance' },

        // Athletes
        { word: 'Cristiano Ronaldo', impostorHint: 'Athlete', hint: 'Siuuuu' },
        { word: 'Lionel Messi', impostorHint: 'Athlete', hint: 'La Pulga' },
        { word: 'LeBron James', impostorHint: 'Athlete', hint: 'Akron Hammer' },
        { word: 'Serena Williams', impostorHint: 'Athlete', hint: 'Grand Slam queen' },
        { word: 'Muhammad Ali', impostorHint: 'Athlete', hint: 'Sting like a bee' },
        { word: 'Mike Tyson', impostorHint: 'Athlete', hint: 'Ear bite' },
        { word: 'Usain Bolt', impostorHint: 'Athlete', hint: 'Lightning fast' },
        { word: 'Virat Kohli', impostorHint: 'Athlete', hint: 'King Kohli' },
        { word: 'David Beckham', impostorHint: 'Athlete', hint: 'Bend it like...' },

        // Musicians
        { word: 'Michael Jackson', impostorHint: 'Icon', hint: 'Moonwalker' },
        { word: 'Taylor Swift', impostorHint: 'Pop Star', hint: 'Swifties leader' },
        { word: 'Beyoncé', impostorHint: 'Icon', hint: 'Single Ladies' },
        { word: 'Kanye West', impostorHint: 'Rapper', hint: 'Graduation bear' },
        { word: 'Eminem', impostorHint: 'Rapper', hint: 'Real Slim Shady' },
        { word: 'Rihanna', impostorHint: 'Pop Star', hint: 'Fenty founder' },
        { word: 'Justin Bieber', impostorHint: 'Pop Star', hint: 'Beliebers' },
        { word: 'Harry Styles', impostorHint: 'Pop Star', hint: 'Watermelon Sugar' },
        { word: 'Drake', impostorHint: 'Rapper', hint: 'Started from the bottom' },
        { word: 'The Weeknd', impostorHint: 'Pop Star', hint: 'Blinding Lights' },
        { word: 'Ariana Grande', impostorHint: 'Pop Star', hint: 'Thank u, next' },
        { word: 'Billie Eilish', impostorHint: 'Pop Star', hint: 'Ocean Eyes' },
        { word: 'Elvis Presley', impostorHint: 'Icon', hint: 'Hound Dog' },
        { word: 'Freddie Mercury', impostorHint: 'Icon', hint: 'Bohemian Rhapsody' },
        { word: 'David Bowie', impostorHint: 'Icon', hint: 'Starman' },
        { word: 'Prince', impostorHint: 'Icon', hint: 'Purple Rain' },
        { word: 'Madonna', impostorHint: 'Icon', hint: 'Material Girl' },
        { word: 'Britney Spears', impostorHint: 'Icon', hint: 'Oops I did it again' },
        { word: 'Shakira', impostorHint: 'Pop Star', hint: 'Waka Waka' },
        { word: 'Jennifer Lopez', impostorHint: 'Activist', hint: 'Jenny from the Block' },

        // Actors
        { word: 'Marilyn Monroe', impostorHint: 'Icon', hint: 'Happy Birthday Mr President' },
        { word: 'Dwayne Johnson', impostorHint: 'Actor', hint: 'People\'s Champ' },
        { word: 'Kevin Hart', impostorHint: 'Comedian', hint: 'Jumanji short guy' },
        { word: 'Will Smith', impostorHint: 'Actor', hint: 'Men is Black' },
        { word: 'Tom Cruise', impostorHint: 'Actor', hint: 'Did his own stunts' },
        { word: 'Brad Pitt', impostorHint: 'Actor', hint: 'Benjamin Button' },
        { word: 'Angelina Jolie', impostorHint: 'Actress', hint: 'Maleficent' },
        { word: 'Leonardo DiCaprio', impostorHint: 'Actor', hint: 'Wolf of Wall St' },
        { word: 'Johnny Depp', impostorHint: 'Actor', hint: 'Jack Sparrow' },
        { word: 'Robert Downey Jr', impostorHint: 'Actor', hint: 'Tony Stark' },
        { word: 'Chris Hemsworth', impostorHint: 'Actor', hint: 'Thor' },
        { word: 'Ryan Reynolds', impostorHint: 'Actor', hint: 'Deadpool' },
        { word: 'Zendaya', impostorHint: 'Actress', hint: 'Rue Bennett' },
        { word: 'Tom Holland', impostorHint: 'Actor', hint: 'MCU Spider-Man' },

        // Influencers
        { word: 'Kim Kardashian', impostorHint: 'Socialite', hint: 'SKIMS founder' },
        { word: 'Kylie Jenner', impostorHint: 'Socialite', hint: 'Lip Kit' },
        { word: 'Oprah Winfrey', impostorHint: 'Host', hint: 'You get a car!' },
        { word: 'Ellen DeGeneres', impostorHint: 'Host', hint: 'Just keep swimming' },
        { word: 'Gordon Ramsay', impostorHint: 'Chef', hint: 'It\'s RAW!' },
    ],
};

/**
 * UI Translation mapping for static UI elements.
 */
export const UI_TRANSLATIONS = {
    en: {
        citizen: 'CITIZEN',
        impostor: 'IMPOSTOR',
        secretWord: 'Secret Word',
        hint: 'Hint',
    },
    // Add other languages here if you want STATIC UI translation support
    // But dynamic content (words) will use the API.
};

/**
 * Get a random word and hint from specific categories or mixed.
 * @param {string|Array<string>} categoryKeys - The key(s) of the category.
 * @returns {Object} { word, hint }
 */

// Track recently used words to avoid immediate repeats
let recentlyUsedWords = [];
const MAX_RECENT_WORDS = 20; // Remember last 20 words

export function getRandomWord(categoryKeys = ['all']) {
    let availableWords = [];
    const keys = Array.isArray(categoryKeys) ? categoryKeys : [categoryKeys];

    // Helper to add category to word objects
    const addCategory = (list, cat) => list.map(w => ({ ...w, category: cat }));

    // If we have specific keys (even if 'all' is present), use them.
    // 'all' alone triggers the default free-only behavior (legacy/fallback).
    const hasSpecificCategories = keys.some(k => k !== 'all');

    if (hasSpecificCategories) {
        // Use the provided keys directly (they are already filtered by SetupScreen/PremiumManager)
        keys.forEach(key => {
            if (key !== 'all' && wordCategories[key]) {
                availableWords = [...availableWords, ...addCategory(wordCategories[key], key)];
            }
        });
    } else {
        // ONLY 'all' is selected (or empty) -> Fallback to defaults (Free categories only)
        // This is safe because SetupScreen now explicitly passes the full list for premium users
        const freeCategories = CATEGORY_LABELS
            .filter(c => c.key !== 'all' && (c.free === true || (!c.premium && !c.free)))
            .flatMap(c => {
                // If category has subcategories, include them instead of parent
                if (c.subcategories) {
                    return c.subcategories.map(sub => sub.key);
                }
                return [c.key];
            });

        // Only add words from free categories
        freeCategories.forEach(key => {
            if (wordCategories[key]) {
                availableWords = [...availableWords, ...addCategory(wordCategories[key], key)];
            }
        });
    }

    // Fallback - shouldn't happen if 'all' is always an option
    if (availableWords.length === 0) {
        availableWords = addCategory(wordCategories.food, 'food');
    }

    // Filter out recently used words if we have enough options
    let filteredWords = availableWords.filter(w => !recentlyUsedWords.includes(w.word));

    // If we've exhausted all words, reset the recent list
    if (filteredWords.length === 0) {
        recentlyUsedWords = [];
        filteredWords = availableWords;
    }

    // Pick random word from filtered list
    const randomIndex = Math.floor(Math.random() * filteredWords.length);
    const selectedWord = filteredWords[randomIndex];

    // Track this word as recently used
    recentlyUsedWords.push(selectedWord.word);
    if (recentlyUsedWords.length > MAX_RECENT_WORDS) {
        recentlyUsedWords.shift(); // Remove oldest
    }

    return selectedWord;
}

export const CATEGORY_LABELS = [
    { key: 'all', label: 'Random (All)' },
    { key: 'dailyLife', label: 'Daily Life', free: true },
    { key: 'things', label: 'Things', free: true },
    { key: 'movies', label: 'Movies', premium: true },
    { key: 'games', label: 'Games', premium: true },
    { key: 'places', label: 'Places', free: true },
    { key: 'food', label: 'Food', free: true },
    { key: 'objects', label: 'Objects', free: true },
    { key: 'trends', label: 'Trends', premium: true },
    { key: 'sport', label: 'Sports', premium: true },
    { key: 'science', label: 'Science', premium: true },
    { key: 'history', label: 'History', premium: true },
    { key: 'mythology', label: 'Myth', premium: true },
    { key: 'nature', label: 'Nature', premium: true },
    { key: 'tech', label: 'Tech', premium: true },
    { key: 'fashion', label: 'Fashion', premium: true },
    { key: 'genZ', label: 'Gen Z', premium: true },
    { key: 'kpop', label: 'K-Pop', premium: true },
    { key: 'anime', label: 'Anime', premium: true },
    {
        key: 'ballKnowledge', label: 'Ball Knowledge', free: true, subcategories: [
            { key: 'football', label: 'Football' },
            { key: 'basketball', label: 'Basketball' },
        ]
    },
    { key: 'famousPeople', label: 'Famous People', premium: true },
];
