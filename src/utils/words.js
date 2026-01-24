/**
 * Dictionary of words categorized for the game.
 * Translations are handled automatically by the API.
 */
export const wordCategories = {
    places: [
        // Cities
        { word: 'Paris', impostorHint: 'Cities', hint: 'City of Lights' },
        { word: 'London', impostorHint: 'Cities', hint: 'Capital of England' },
        { word: 'Tokyo', impostorHint: 'Cities', hint: 'Capital of Japan' },
        { word: 'New York', impostorHint: 'Cities', hint: 'The Big Apple' },
        { word: 'Dubai', impostorHint: 'Cities', hint: 'City of skyscrapers' },
        { word: 'Egypt', impostorHint: 'Cities', hint: 'Land of Pyramids' },

        // Buildings
        { word: 'School', impostorHint: 'Buildings', hint: 'Place for learning' },
        { word: 'Library', impostorHint: 'Buildings', hint: 'Quiet place with books' },
        { word: 'Hospital', impostorHint: 'Buildings', hint: 'Place for the sick' },
        { word: 'Airport', impostorHint: 'Buildings', hint: 'Planes land here' },
        { word: 'Cinema', impostorHint: 'Buildings', hint: 'Watch movies here' },
        { word: 'Park', impostorHint: 'Buildings', hint: 'Green space in city' },
        { word: 'Gym', impostorHint: 'Buildings', hint: 'Place to exercise' },
        { word: 'Restaurant', impostorHint: 'Buildings', hint: 'Place to eat out' },
        { word: 'Hotel', impostorHint: 'Buildings', hint: 'Stay for a night' },
        { word: 'Stadium', impostorHint: 'Buildings', hint: 'Sports arena' },
        { word: 'Museum', impostorHint: 'Buildings', hint: 'History and art' },
        { word: 'Zoo', impostorHint: 'Buildings', hint: 'See wild animals' },

        // Nature
        { word: 'Beach', impostorHint: 'Nature', hint: 'Sand and sea' },
        { word: 'Forest', impostorHint: 'Nature', hint: 'Many trees' },
        { word: 'Desert', impostorHint: 'Nature', hint: 'Hot sandy place' },
        { word: 'Ocean', impostorHint: 'Nature', hint: 'Biggest water body' },
        { word: 'Island', impostorHint: 'Nature', hint: 'Land surrounded by water' },
        { word: 'Mountain', impostorHint: 'Nature', hint: 'High elevation' },
        { word: 'Cave', impostorHint: 'Nature', hint: 'Underground hollow' },
        { word: 'Waterfall', impostorHint: 'Nature', hint: 'Cascading water' },
        { word: 'Lake', impostorHint: 'Nature', hint: 'Inland water body' },

        // Landmarks
        { word: 'Moon', impostorHint: 'Landmarks', hint: 'Earth\'s natural satellite' },
        { word: 'Mars', impostorHint: 'Landmarks', hint: 'The Red Planet' },
        { word: 'Mount Everest', impostorHint: 'Landmarks', hint: 'Highest mountain' },
        { word: 'Antarctica', impostorHint: 'Landmarks', hint: 'Frozen continent' },
        { word: 'Space Station', impostorHint: 'Landmarks', hint: 'Orbiting lab' },
    ],
    food: [
        // Fruits
        { word: 'Apple', impostorHint: 'Fruits', hint: 'A red or green fruit' },
        { word: 'Banana', impostorHint: 'Fruits', hint: 'Yellow curved fruit' },
        { word: 'Orange', impostorHint: 'Fruits', hint: 'Citrus fruit' },
        { word: 'Grape', impostorHint: 'Fruits', hint: 'Small round fruit' },
        { word: 'Strawberry', impostorHint: 'Fruits', hint: 'Red berry' },

        // Vegetables
        { word: 'Potato', impostorHint: 'Vegetables', hint: 'Starch tuber' },
        { word: 'Tomato', impostorHint: 'Vegetables', hint: 'Red vegetable/fruit' },
        { word: 'Onion', impostorHint: 'Vegetables', hint: 'Makes you cry' },
        { word: 'Garlic', impostorHint: 'Vegetables', hint: 'Vampires hate it' },
        { word: 'Salad', impostorHint: 'Vegetables', hint: 'Bowl of vegetables' },

        // Meals
        { word: 'Sushi', impostorHint: 'Meals', hint: 'Japanese rice dish' },
        { word: 'Burger', impostorHint: 'Meals', hint: 'Sandwich with a patty' },
        { word: 'Pasta', impostorHint: 'Meals', hint: 'Italian noodle dish' },
        { word: 'Steak', impostorHint: 'Meals', hint: 'Grilled beef' },
        { word: 'Chicken', impostorHint: 'Meals', hint: 'Common poultry' },
        { word: 'Rice', impostorHint: 'Meals', hint: 'Small white grains' },
        { word: 'Sandwich', impostorHint: 'Meals', hint: 'Bread with filling' },
        { word: 'Soup', impostorHint: 'Meals', hint: 'Hot liquid dish' },
        { word: 'Noodles', impostorHint: 'Meals', hint: 'Long thin pasta' },

        // Desserts
        { word: 'Ice Cream', impostorHint: 'Desserts', hint: 'Frozen dessert' },
        { word: 'Chocolate', impostorHint: 'Desserts', hint: 'Sweet treat from cocoa' },
        { word: 'Donut', impostorHint: 'Desserts', hint: 'Ring-shaped sweet' },
        { word: 'Cake', impostorHint: 'Desserts', hint: 'Birthday dessert' },
        { word: 'Cookie', impostorHint: 'Desserts', hint: 'Baked sweet snack' },
        { word: 'Pie', impostorHint: 'Desserts', hint: 'Filled pastry' },

        // Drinks
        { word: 'Coffee', impostorHint: 'Drinks', hint: 'Caffeinated morning drink' },
        { word: 'Tea', impostorHint: 'Drinks', hint: 'Hot leaf drink' },
        { word: 'Juice', impostorHint: 'Drinks', hint: 'Liquid from fruit' },

        // Breakfast
        { word: 'Waffle', impostorHint: 'Breakfast', hint: 'Grid breakfast' },
        { word: 'Pancake', impostorHint: 'Breakfast', hint: 'Flat breakfast cake' },
        { word: 'Egg', impostorHint: 'Breakfast', hint: 'Laid by hens' },

        // Basics
        { word: 'Bread', impostorHint: 'Basics', hint: 'Baked dough' },
        { word: 'Cheese', impostorHint: 'Basics', hint: 'Dairy product' },
        { word: 'Pickle', impostorHint: 'Basics', hint: 'Sour preserved' },
    ],
    movies: [
        // Superhero/Action Movies
        { word: 'Avengers', impostorHint: 'Action', hint: 'Earths mightiest heroes' },
        { word: 'Star Wars', impostorHint: 'Action', hint: 'Space saga' },
        { word: 'The Matrix', impostorHint: 'Action', hint: 'Red or blue pill' },
        { word: 'Inception', impostorHint: 'Action', hint: 'Dream within a dream' },
        { word: 'The Dark Knight', impostorHint: 'Action', hint: 'Batman sequel' },
        { word: 'Spiderman', impostorHint: 'Action', hint: 'Web slinger' },
        { word: 'Iron Man', impostorHint: 'Action', hint: 'Tony Stark' },
        { word: 'Batman', impostorHint: 'Action', hint: 'The Dark Knight' },
        { word: 'Superman', impostorHint: 'Action', hint: 'Man of Steel' },
        { word: 'Black Panther', impostorHint: 'Action', hint: 'Wakanda forever' },
        { word: 'Deadpool', impostorHint: 'Action', hint: 'Merc with a mouth' },
        { word: 'Guardians of the Galaxy', impostorHint: 'Action', hint: 'Space outlaws' },
        { word: 'Doctor Strange', impostorHint: 'Action', hint: 'Master of mystic arts' },
        { word: 'Thor', impostorHint: 'Action', hint: 'God of thunder' },
        { word: 'Captain America', impostorHint: 'Action', hint: 'First Avenger' },
        { word: 'Wonder Woman', impostorHint: 'Action', hint: 'Amazon warrior' },
        { word: 'Aquaman', impostorHint: 'Action', hint: 'King of Atlantis' },
        { word: 'The Flash', impostorHint: 'Action', hint: 'Fastest man alive' },
        { word: 'Dune', impostorHint: 'Action', hint: 'Desert planet spice' },
        { word: 'Mad Max', impostorHint: 'Action', hint: 'Post-apocalyptic wasteland' },
        { word: 'Terminator', impostorHint: 'Action', hint: 'Ill be back' },
        { word: 'Alien', impostorHint: 'Action', hint: 'Space horror' },
        { word: 'Predator', impostorHint: 'Action', hint: 'Invisible hunter' },
        { word: 'Transformers', impostorHint: 'Action', hint: 'Robots in disguise' },
        { word: 'Fast and Furious', impostorHint: 'Action', hint: 'Street racing family' },
        { word: 'Mission Impossible', impostorHint: 'Action', hint: 'Tom Cruise stunts' },
        { word: 'James Bond', impostorHint: 'Action', hint: '007 spy' },
        { word: 'John Wick', impostorHint: 'Action', hint: 'Legendary assassin' },

        // Animated/Family Movies
        { word: 'Avatar', impostorHint: 'Animated', hint: 'Blue aliens movie' },
        { word: 'The Lion King', impostorHint: 'Animated', hint: 'Circle of life' },
        { word: 'Frozen', impostorHint: 'Animated', hint: 'Let it go' },
        { word: 'Toy Story', impostorHint: 'Animated', hint: 'Animated toys' },
        { word: 'Finding Nemo', impostorHint: 'Animated', hint: 'Lost clownfish' },
        { word: 'Shrek', impostorHint: 'Animated', hint: 'Green ogre' },
        { word: 'Moana', impostorHint: 'Animated', hint: 'Ocean voyager' },
        { word: 'Encanto', impostorHint: 'Animated', hint: 'We dont talk about Bruno' },

        // Classic/Drama Movies
        { word: 'Titanic', impostorHint: 'Drama', hint: 'Sinking ship movie' },
        { word: 'Jurassic Park', impostorHint: 'Drama', hint: 'Dinosaur theme park' },
        { word: 'Harry Potter', impostorHint: 'Drama', hint: 'The Boy Who Lived' },
        { word: 'Lord of the Rings', impostorHint: 'Drama', hint: 'One ring to rule them all' },
        { word: 'The Godfather', impostorHint: 'Drama', hint: 'Mafia classic' },
        { word: 'Forrest Gump', impostorHint: 'Drama', hint: 'Life is like a box of chocolates' },
        { word: 'Pulp Fiction', impostorHint: 'Drama', hint: 'Tarantino classic' },
        { word: 'The Shawshank Redemption', impostorHint: 'Drama', hint: 'Prison escape' },
        { word: 'Gladiator', impostorHint: 'Drama', hint: 'Roman warrior' },
        { word: 'Jaws', impostorHint: 'Drama', hint: 'Killer shark' },
        { word: 'E.T.', impostorHint: 'Drama', hint: 'Phone home' },
        { word: 'Back to the Future', impostorHint: 'Drama', hint: 'Time travel DeLorean' },
        { word: 'Rocky', impostorHint: 'Drama', hint: 'Boxing underdog' },
        { word: 'Interstellar', impostorHint: 'Drama', hint: 'Space exploration' },
        { word: 'Oppenheimer', impostorHint: 'Drama', hint: 'Atomic bomb creator' },
        { word: 'Barbie', impostorHint: 'Drama', hint: 'Famous doll movie' },
        { word: 'Top Gun', impostorHint: 'Drama', hint: 'Fighter pilot' },
        { word: 'The Hunger Games', impostorHint: 'Drama', hint: 'Battle royale dystopia' },
        { word: 'Twilight', impostorHint: 'Drama', hint: 'Vampire romance' },
        { word: 'Pirates of the Caribbean', impostorHint: 'Drama', hint: 'Captain Jack Sparrow' },

        // TV Series
        { word: 'Game of Thrones', impostorHint: 'TV Series', hint: 'Fantasy TV series' },
        { word: 'Friends', impostorHint: 'TV Series', hint: 'Classic sitcom' },
        { word: 'Breaking Bad', impostorHint: 'TV Series', hint: 'Chemistry teacher turns criminal' },
        { word: 'Stranger Things', impostorHint: 'TV Series', hint: 'Upside down world' },
        { word: 'The Office', impostorHint: 'TV Series', hint: 'Mockumentary workplace' },
        { word: 'Squid Game', impostorHint: 'TV Series', hint: 'Korean survival games' },
        { word: 'Wednesday', impostorHint: 'TV Series', hint: 'Addams Family daughter' },
        { word: 'The Mandalorian', impostorHint: 'TV Series', hint: 'This is the way' },
    ],
    games: [
        // Battle Royale/Shooter
        { word: 'Fortnite', impostorHint: 'Shooter', hint: 'Battle royale game' },
        { word: 'Among Us', impostorHint: 'Shooter', hint: 'Imposter game' },
        { word: 'Call of Duty', impostorHint: 'Shooter', hint: 'War shooter game' },
        { word: 'Valorant', impostorHint: 'Shooter', hint: 'Tactical shooter' },
        { word: 'Counter-Strike', impostorHint: 'Shooter', hint: 'Terrorists vs CT' },
        { word: 'Overwatch', impostorHint: 'Shooter', hint: 'Hero shooter' },
        { word: 'Apex Legends', impostorHint: 'Shooter', hint: 'Battle royale legends' },
        { word: 'PUBG', impostorHint: 'Shooter', hint: 'PlayerUnknowns Battlegrounds' },
        { word: 'Halo', impostorHint: 'Shooter', hint: 'Master Chief' },

        // Sandbox/Adventure
        { word: 'Minecraft', impostorHint: 'Sandbox', hint: 'Block building game' },
        { word: 'Roblox', impostorHint: 'Sandbox', hint: 'Online game platform' },
        { word: 'Grand Theft Auto', impostorHint: 'Sandbox', hint: 'Open world crime' },
        { word: 'The Sims', impostorHint: 'Sandbox', hint: 'Life simulation' },
        { word: 'Animal Crossing', impostorHint: 'Sandbox', hint: 'Island life' },
        { word: 'Stardew Valley', impostorHint: 'Sandbox', hint: 'Farming simulator' },
        { word: 'Terraria', impostorHint: 'Sandbox', hint: '2D sandbox adventure' },
        { word: 'Red Dead Redemption', impostorHint: 'Sandbox', hint: 'Wild west outlaw' },

        // Classic/Retro
        { word: 'Pokémon', impostorHint: 'Retro', hint: 'Gotta catch em all' },
        { word: 'Mario', impostorHint: 'Retro', hint: 'Italian plumber' },
        { word: 'Zelda', impostorHint: 'Retro', hint: 'Link saves Hyrule' },
        { word: 'Sonic', impostorHint: 'Retro', hint: 'Blue hedgehog' },
        { word: 'Pac-Man', impostorHint: 'Retro', hint: 'Yellow dot eater' },
        { word: 'Tetris', impostorHint: 'Retro', hint: 'Falling blocks puzzle' },

        // MOBA/Strategy
        { word: 'League of Legends', impostorHint: 'Strategy', hint: 'MOBA game' },
        { word: 'Dota', impostorHint: 'Strategy', hint: 'Defense of the Ancients' },
        { word: 'Rocket League', impostorHint: 'Strategy', hint: 'Soccer with cars' },
        { word: 'FIFA', impostorHint: 'Strategy', hint: 'Soccer simulation' },

        // Mobile/Casual
        { word: 'Fall Guys', impostorHint: 'Casual', hint: 'Obstacle course beans' },
        { word: 'Candy Crush', impostorHint: 'Casual', hint: 'Match-3 puzzle' },
        { word: 'Angry Birds', impostorHint: 'Casual', hint: 'Slingshot birds' },
        { word: 'Clash of Clans', impostorHint: 'Casual', hint: 'Village builder' },
        { word: 'Clash Royale', impostorHint: 'Casual', hint: 'Card battle arena' },
        { word: 'Subway Surfers', impostorHint: 'Casual', hint: 'Endless runner' },
        { word: 'Temple Run', impostorHint: 'Casual', hint: 'Run from monkey' },
        { word: 'Fruit Ninja', impostorHint: 'Casual', hint: 'Slice fruit' },

        // RPG/Action
        { word: 'Undertale', impostorHint: 'RPG', hint: 'Spare or fight' },
        { word: 'Cuphead', impostorHint: 'RPG', hint: 'Cartoon boss rush' },
        { word: 'Hollow Knight', impostorHint: 'RPG', hint: 'Bug metroidvania' },
        { word: 'Celeste', impostorHint: 'RPG', hint: 'Mountain climbing platformer' },
        { word: 'Hades', impostorHint: 'RPG', hint: 'Greek underworld roguelike' },
        { word: 'Dark Souls', impostorHint: 'RPG', hint: 'You died' },
        { word: 'Elden Ring', impostorHint: 'RPG', hint: 'Open world souls' },
        { word: 'Skyrim', impostorHint: 'RPG', hint: 'Fus Ro Dah' },
        { word: 'Fallout', impostorHint: 'RPG', hint: 'Post-nuclear wasteland' },
        { word: 'The Witcher', impostorHint: 'RPG', hint: 'Geralt monster hunter' },
        { word: 'Assassins Creed', impostorHint: 'RPG', hint: 'Historical parkour' },
        { word: 'God of War', impostorHint: 'RPG', hint: 'Kratos rage' },
        { word: 'The Last of Us', impostorHint: 'RPG', hint: 'Zombie survival' },
        { word: 'Uncharted', impostorHint: 'RPG', hint: 'Treasure hunter' },
        { word: 'Spider-Man', impostorHint: 'RPG', hint: 'Web-swinging hero' },
        { word: 'Batman Arkham', impostorHint: 'RPG', hint: 'Dark Knight detective' },
        { word: 'Genshin Impact', impostorHint: 'RPG', hint: 'Anime open world' },
        { word: 'Honkai Star Rail', impostorHint: 'RPG', hint: 'Space fantasy RPG' },
        { word: 'Final Fantasy', impostorHint: 'RPG', hint: 'JRPG classic' },
        { word: 'Dragon Quest', impostorHint: 'RPG', hint: 'Slime adventure' },
        { word: 'Persona', impostorHint: 'RPG', hint: 'Social link RPG' },
        { word: 'Metal Gear Solid', impostorHint: 'RPG', hint: 'Stealth espionage' },

        // Fighting
        { word: 'Mortal Kombat', impostorHint: 'Fighting', hint: 'Finish him' },
        { word: 'Street Fighter', impostorHint: 'Fighting', hint: 'Hadouken' },
        { word: 'Super Smash Bros', impostorHint: 'Fighting', hint: 'Nintendo brawler' },
        { word: 'Tekken', impostorHint: 'Fighting', hint: 'King of Iron Fist' },

        // Horror
        { word: 'Resident Evil', impostorHint: 'Horror', hint: 'Zombie horror' },
        { word: 'Silent Hill', impostorHint: 'Horror', hint: 'Psychological horror' },
        { word: 'Five Nights at Freddys', impostorHint: 'Horror', hint: 'Animatronic horror' },
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
        { word: 'AI', impostorHint: 'Tech Trends', hint: 'Artificial Intelligence' },
        { word: 'Crypto', impostorHint: 'Tech Trends', hint: 'Digital currency' },
        { word: 'NFT', impostorHint: 'Tech Trends', hint: 'Digital collectible' },
        { word: 'Metaverse', impostorHint: 'Tech Trends', hint: 'Virtual world' },
        { word: 'Drone', impostorHint: 'Tech Trends', hint: 'Flying robot' },
        { word: 'Electric Car', impostorHint: 'Tech Trends', hint: 'Tesla' },
        { word: 'Smartwatch', impostorHint: 'Tech Trends', hint: 'Wearable tech' },
        { word: 'Cloud', impostorHint: 'Tech Trends', hint: 'Online storage' },
        { word: 'Wi-Fi', impostorHint: 'Tech Trends', hint: 'Wireless internet' },

        // Social Media
        { word: 'Influencer', impostorHint: 'Social Media', hint: 'Famous on social media' },
        { word: 'Streaming', impostorHint: 'Social Media', hint: 'Live broadcasting' },
        { word: 'Meme', impostorHint: 'Social Media', hint: 'Funny internet picture' },
        { word: 'Viral', impostorHint: 'Social Media', hint: 'Spreads fast online' },
        { word: 'Selfie', impostorHint: 'Social Media', hint: 'Photo of yourself' },
        { word: 'Hashtag', impostorHint: 'Social Media', hint: 'Used on Twitter/Insta' },
        { word: 'Podcast', impostorHint: 'Social Media', hint: 'Audio show' },
        { word: 'Vlog', impostorHint: 'Social Media', hint: 'Video blog' },
        { word: 'Filter', impostorHint: 'Social Media', hint: 'Changes photo look' },
        { word: 'Reel', impostorHint: 'Social Media', hint: 'Short Instagram video' },
        { word: 'Challenge', impostorHint: 'Social Media', hint: 'Trending task' },
        { word: 'Algorithm', impostorHint: 'Social Media', hint: 'Controls feed' },
        { word: 'Troll', impostorHint: 'Social Media', hint: 'Internet pest' },

        // Digital Life
        { word: 'Remote Work', impostorHint: 'Digital Life', hint: 'Working from home' },
        { word: 'Bot', impostorHint: 'Digital Life', hint: 'Automated account' },
        { word: 'App', impostorHint: 'Digital Life', hint: 'Software on phone' },
        { word: 'Emoji', impostorHint: 'Digital Life', hint: 'Digital emotion icons' },
        { word: 'GIF', impostorHint: 'Digital Life', hint: 'Moving image' },
        { word: 'Screenshot', impostorHint: 'Digital Life', hint: 'Capture phone screen' },
        { word: 'Notification', impostorHint: 'Digital Life', hint: 'Phone alert' },
        { word: 'Download', impostorHint: 'Digital Life', hint: 'Get from internet' },
        { word: 'Upload', impostorHint: 'Digital Life', hint: 'Send to internet' },
        { word: 'Password', impostorHint: 'Digital Life', hint: 'Login security' },
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
        { word: 'Box', impostorHint: 'Containers', hint: 'Container' },
        { word: 'Vase', impostorHint: 'Containers', hint: 'Holds flowers' },
        { word: 'Pot', impostorHint: 'Containers', hint: 'Cooking vessel' },
        { word: 'Pan', impostorHint: 'Containers', hint: 'Frying vessel' },

        // Accessories
        { word: 'Ball', impostorHint: 'Accessories', hint: 'Round object' },
        { word: 'Ring', impostorHint: 'Accessories', hint: 'Worn on finger' },
        { word: 'Chain', impostorHint: 'Accessories', hint: 'Linked metal' },

        // Security
        { word: 'Lock', impostorHint: 'Security', hint: 'Secures things' },
        { word: 'Key', impostorHint: 'Security', hint: 'Opens lock' },

        // House Parts
        { word: 'Door', impostorHint: 'House Parts', hint: 'Entryway' },
        { word: 'Window', impostorHint: 'House Parts', hint: 'Look through it' },
        { word: 'Wall', impostorHint: 'House Parts', hint: 'Brick divider' },
        { word: 'Floor', impostorHint: 'House Parts', hint: 'Stand on it' },
        { word: 'Roof', impostorHint: 'House Parts', hint: 'Top of house' },

        // Home Items
        { word: 'Fan', impostorHint: 'Home Items', hint: 'Moves air' },
        { word: 'Lamp', impostorHint: 'Home Items', hint: 'Gives light' },
        { word: 'Candle', impostorHint: 'Home Items', hint: 'Wax light' },
        { word: 'Pillow', impostorHint: 'Home Items', hint: 'Head rest' },
        { word: 'Blanket', impostorHint: 'Home Items', hint: 'Keeps warm' },
        { word: 'Curtain', impostorHint: 'Home Items', hint: 'Covers window' },
        { word: 'Carpet', impostorHint: 'Home Items', hint: 'Floor rug' },

        // Hygiene
        { word: 'Soap', impostorHint: 'Hygiene', hint: 'Cleaning bar' },
        { word: 'Toothbrush', impostorHint: 'Hygiene', hint: 'Cleans teeth' },

        // Tools
        { word: 'Ladder', impostorHint: 'Tools', hint: 'Climb up' },
        { word: 'Hammer', impostorHint: 'Tools', hint: 'Hits nails' },
        { word: 'Screw', impostorHint: 'Tools', hint: 'Threaded fastener' },
        { word: 'Nail', impostorHint: 'Tools', hint: 'Metal pin' },
        { word: 'Drill', impostorHint: 'Tools', hint: 'Makes holes' },
        { word: 'Paint', impostorHint: 'Tools', hint: 'Colors walls' },
        { word: 'Brush', impostorHint: 'Tools', hint: 'Applies paint' },
        { word: 'Rope', impostorHint: 'Tools', hint: 'Thick string' },
        { word: 'Tape', impostorHint: 'Tools', hint: 'Sticky strip' },
    ],
    science: [
        // Physics
        { word: 'Atom', impostorHint: 'Physics', hint: 'Basic unit of matter' },
        { word: 'Gravity', impostorHint: 'Physics', hint: 'Keeps us on ground' },
        { word: 'Laser', impostorHint: 'Physics', hint: 'Focused light beam' },
        { word: 'Magnet', impostorHint: 'Physics', hint: 'Attracts iron' },
        { word: 'Battery', impostorHint: 'Physics', hint: 'Stores energy' },

        // Space
        { word: 'Galaxy', impostorHint: 'Space', hint: 'Collection of stars' },
        { word: 'Planet', impostorHint: 'Space', hint: 'Orbits a star' },
        { word: 'Satellite', impostorHint: 'Space', hint: 'Orbits Earth' },
        { word: 'Rocket', impostorHint: 'Space', hint: 'Goes to space' },
        { word: 'Astronaut', impostorHint: 'Space', hint: 'Space traveler' },
        { word: 'Black Hole', impostorHint: 'Space', hint: 'Light cannot escape' },
        { word: 'Meteor', impostorHint: 'Space', hint: 'Falling star' },

        // Biology
        { word: 'DNA', impostorHint: 'Biology', hint: 'Genetic code' },
        { word: 'Virus', impostorHint: 'Biology', hint: 'Microscopic agent' },
        { word: 'Fossil', impostorHint: 'Biology', hint: 'Old bone in rock' },
        { word: 'Evolution', impostorHint: 'Biology', hint: 'Change over time' },

        // Earth Science
        { word: 'Volcano', impostorHint: 'Earth Science', hint: 'Erupts with lava' },

        // Technology
        { word: 'Robot', impostorHint: 'Technology', hint: 'Mechanical helper' },
        { word: 'Telescope', impostorHint: 'Technology', hint: 'See far away' },
        { word: 'Microscope', impostorHint: 'Technology', hint: 'See tiny things' },

        // Lab
        { word: 'Laboratory', impostorHint: 'Lab', hint: 'Science work place' },
        { word: 'Chemical', impostorHint: 'Lab', hint: 'Reactive substance' },
        { word: 'Beaker', impostorHint: 'Lab', hint: 'Glass container' },
        { word: 'Formula', impostorHint: 'Lab', hint: 'Math recipe' },
        { word: 'Experiment', impostorHint: 'Lab', hint: 'Scientific test' },
    ],
    history: [
        // Ancient Egypt
        { word: 'Pyramid', impostorHint: 'Ancient Egypt', hint: 'Egyptian tomb' },
        { word: 'Pharaoh', impostorHint: 'Ancient Egypt', hint: 'Egyptian king' },
        { word: 'Mummy', impostorHint: 'Ancient Egypt', hint: 'Wrapped body' },

        // Warriors
        { word: 'Knight', impostorHint: 'Warriors', hint: 'Medieval warrior' },
        { word: 'Viking', impostorHint: 'Warriors', hint: 'Norse seafarer' },
        { word: 'Samurai', impostorHint: 'Warriors', hint: 'Japanese warrior' },
        { word: 'Gladiator', impostorHint: 'Warriors', hint: 'Roman fighter' },

        // Medieval
        { word: 'Castle', impostorHint: 'Medieval', hint: 'Fortified home' },
        { word: 'Sword', impostorHint: 'Medieval', hint: 'Sharp weapon' },
        { word: 'Shield', impostorHint: 'Medieval', hint: 'Protection tool' },

        // Royalty
        { word: 'Crown', impostorHint: 'Royalty', hint: 'Royal hat' },
        { word: 'Throne', impostorHint: 'Royalty', hint: 'Royal chair' },
        { word: 'Empire', impostorHint: 'Royalty', hint: 'Large kingdom' },

        // Events
        { word: 'War', impostorHint: 'Events', hint: 'Large conflict' },
        { word: 'Peace', impostorHint: 'Events', hint: 'No fighting' },
        { word: 'Revolution', impostorHint: 'Events', hint: 'Big change' },
        { word: 'Discovery', impostorHint: 'Events', hint: 'Finding new lands' },

        // Artifacts
        { word: 'Ancient', impostorHint: 'Artifacts', hint: 'Very old' },
        { word: 'Coin', impostorHint: 'Artifacts', hint: 'Metal money' },
        { word: 'Map', impostorHint: 'Artifacts', hint: 'Guide to places' },
    ],
    mythology: [
        // Creatures
        { word: 'Dragon', impostorHint: 'Creatures', hint: 'Fire breathing lizard' },
        { word: 'Unicorn', impostorHint: 'Creatures', hint: 'Horse with horn' },
        { word: 'Mermaid', impostorHint: 'Creatures', hint: 'Fish woman' },
        { word: 'Phoenix', impostorHint: 'Creatures', hint: 'Fire bird' },

        // Greek Gods
        { word: 'Zeus', impostorHint: 'Greek Gods', hint: 'Greek god of sky' },
        { word: 'Hercules', impostorHint: 'Greek Gods', hint: 'Strong hero' },
        { word: 'Medusa', impostorHint: 'Greek Gods', hint: 'Snake hair' },
        { word: 'Poseidon', impostorHint: 'Greek Gods', hint: 'God of sea' },
        { word: 'Hades', impostorHint: 'Greek Gods', hint: 'God of underword' },

        // Norse
        { word: 'Thor', impostorHint: 'Norse', hint: 'Norse god of thunder' },

        // Monsters
        { word: 'Ghost', impostorHint: 'Monsters', hint: 'Spirit' },
        { word: 'Vampire', impostorHint: 'Monsters', hint: 'Drinks blood' },
        { word: 'Werewolf', impostorHint: 'Monsters', hint: 'Wolf man' },
        { word: 'Giant', impostorHint: 'Monsters', hint: 'Very big person' },
        { word: 'Demon', impostorHint: 'Monsters', hint: 'Evil spirit' },

        // Magic
        { word: 'Wizard', impostorHint: 'Magic', hint: 'User of magic' },
        { word: 'Witch', impostorHint: 'Magic', hint: 'Magic woman' },
        { word: 'Fairy', impostorHint: 'Magic', hint: 'Small magical flyer' },
        { word: 'Elf', impostorHint: 'Magic', hint: 'Pointy eared' },
        { word: 'Angel', impostorHint: 'Magic', hint: 'Divine being' },
    ],
    nature: [
        // Flowers
        { word: 'Flower', impostorHint: 'Flowers', hint: 'Colorful plant part' },
        { word: 'Rose', impostorHint: 'Flowers', hint: 'Love flower' },
        { word: 'Sunflower', impostorHint: 'Flowers', hint: 'Follows the sun' },

        // Plants
        { word: 'Grass', impostorHint: 'Plants', hint: 'Green ground cover' },
        { word: 'Cactus', impostorHint: 'Plants', hint: 'Spiky desert plant' },
        { word: 'Palm Tree', impostorHint: 'Plants', hint: 'Tropical tree' },
        { word: 'Leaf', impostorHint: 'Plants', hint: 'On a branch' },
        { word: 'Root', impostorHint: 'Plants', hint: 'Underground plant part' },
        { word: 'Seed', impostorHint: 'Plants', hint: 'Starts a plant' },
        { word: 'Soil', impostorHint: 'Plants', hint: 'Dirt for plants' },
        { word: 'Mushroom', impostorHint: 'Plants', hint: 'Fungi' },
        { word: 'Bamboo', impostorHint: 'Plants', hint: 'Panda food' },
        { word: 'Vine', impostorHint: 'Plants', hint: 'Climbing plant' },

        // Forests
        { word: 'Forest', impostorHint: 'Forests', hint: 'Many trees' },
        { word: 'Jungle', impostorHint: 'Forests', hint: 'Thick forest' },
        { word: 'Rainforest', impostorHint: 'Forests', hint: 'Wet jungle' },

        // Water
        { word: 'River', impostorHint: 'Water', hint: 'Flowing water' },
        { word: 'Ocean', impostorHint: 'Water', hint: 'Salty water' },
        { word: 'Lake', impostorHint: 'Water', hint: 'Inland water' },
        { word: 'Pond', impostorHint: 'Water', hint: 'Small lake' },
        { word: 'Swamp', impostorHint: 'Water', hint: 'Wet muddy land' },

        // Landforms
        { word: 'Desert', impostorHint: 'Landforms', hint: 'Dry sandy place' },
        { word: 'Mountain', impostorHint: 'Landforms', hint: 'High rock' },
        { word: 'Valley', impostorHint: 'Landforms', hint: 'Low land' },
        { word: 'Canyon', impostorHint: 'Landforms', hint: 'Deep gorge' },
        { word: 'Cliff', impostorHint: 'Landforms', hint: 'Steep drop' },
        { word: 'Cave', impostorHint: 'Landforms', hint: 'Dark hole in rock' },
        { word: 'Beach', impostorHint: 'Landforms', hint: 'Sand by sea' },
        { word: 'Island', impostorHint: 'Landforms', hint: 'Surrounded by water' },
        { word: 'Volcano', impostorHint: 'Landforms', hint: 'Erupts lava' },
    ],
    tech: [
        // Computing
        { word: 'Robot', impostorHint: 'Computing', hint: 'Automated machine' },
        { word: 'Computer', impostorHint: 'Computing', hint: 'Think machine' },
        { word: 'Internet', impostorHint: 'Computing', hint: 'World wide web' },
        { word: 'Software', impostorHint: 'Computing', hint: 'Code programs' },
        { word: 'Hardware', impostorHint: 'Computing', hint: 'Physical parts' },
        { word: 'Server', impostorHint: 'Computing', hint: 'Hosts data' },
        { word: 'Cloud', impostorHint: 'Computing', hint: 'Remote storage' },
        { word: 'Database', impostorHint: 'Computing', hint: 'Stores info' },

        // Peripherals
        { word: 'Keyboard', impostorHint: 'Peripherals', hint: 'Typing tool' },
        { word: 'Mouse', impostorHint: 'Peripherals', hint: 'Clicking tool' },
        { word: 'Screen', impostorHint: 'Peripherals', hint: 'Display' },
        { word: 'Headphones', impostorHint: 'Peripherals', hint: 'Ear speakers' },
        { word: 'Microphone', impostorHint: 'Peripherals', hint: 'Voice input' },

        // Power & Connectivity
        { word: 'Battery', impostorHint: 'Power', hint: 'Power cell' },
        { word: 'Charger', impostorHint: 'Power', hint: 'Refills battery' },
        { word: 'Cable', impostorHint: 'Power', hint: 'Wire connector' },
        { word: 'Wifi', impostorHint: 'Power', hint: 'Wireless net' },
        { word: 'Bluetooth', impostorHint: 'Power', hint: 'Short range wireless' },

        // Security
        { word: 'Hacker', impostorHint: 'Security', hint: 'Breaks security' },
        { word: 'Virus', impostorHint: 'Security', hint: 'Malware' },
        { word: 'Firewall', impostorHint: 'Security', hint: 'Network protection' },
        { word: 'Encryption', impostorHint: 'Security', hint: 'Secret code' },
        { word: 'Password', impostorHint: 'Security', hint: 'Secret key' },

        // Communication
        { word: 'Email', impostorHint: 'Communication', hint: 'Digital mail' },
        { word: 'Chat', impostorHint: 'Communication', hint: 'Online talk' },

        // Gaming
        { word: 'Video Game', impostorHint: 'Gaming', hint: 'Digital play' },
        { word: 'Console', impostorHint: 'Gaming', hint: 'Gaming box' },
        { word: 'Controller', impostorHint: 'Gaming', hint: 'Game input' },

        // Display
        { word: 'Pixel', impostorHint: 'Display', hint: 'Dot on screen' },
        { word: 'Bug', impostorHint: 'Display', hint: 'Error in code' },
    ],
    fashion: [
        // Tops
        { word: 'Dress', impostorHint: 'Tops', hint: 'One piece cloth' },
        { word: 'Shirt', impostorHint: 'Tops', hint: 'Upper body cloth' },
        { word: 'Jacket', impostorHint: 'Tops', hint: 'Outer wear' },
        { word: 'Coat', impostorHint: 'Tops', hint: 'Warm outer wear' },
        { word: 'Suit', impostorHint: 'Tops', hint: 'Formal set' },

        // Bottoms
        { word: 'Skirt', impostorHint: 'Bottoms', hint: 'Lower body cloth' },
        { word: 'Pants', impostorHint: 'Bottoms', hint: 'Leg covering' },
        { word: 'Jeans', impostorHint: 'Bottoms', hint: 'Denim pants' },

        // Headwear
        { word: 'Hat', impostorHint: 'Headwear', hint: 'Head wear' },
        { word: 'Cap', impostorHint: 'Headwear', hint: 'Casual hat' },

        // Accessories
        { word: 'Scarf', impostorHint: 'Accessories', hint: 'Neck warmer' },
        { word: 'Gloves', impostorHint: 'Accessories', hint: 'Hand warmers' },
        { word: 'Belt', impostorHint: 'Accessories', hint: 'Holds pants' },
        { word: 'Tie', impostorHint: 'Accessories', hint: 'Formal neck wear' },
        { word: 'Watch', impostorHint: 'Accessories', hint: 'Wrist time' },
        { word: 'Glasses', impostorHint: 'Accessories', hint: 'Eye aid' },
        { word: 'Sunglasses', impostorHint: 'Accessories', hint: 'Dark glasses' },

        // Footwear
        { word: 'Socks', impostorHint: 'Footwear', hint: 'Foot covers' },
        { word: 'Shoes', impostorHint: 'Footwear', hint: 'Foot wear' },
        { word: 'Boots', impostorHint: 'Footwear', hint: 'High shoes' },
        { word: 'Heels', impostorHint: 'Footwear', hint: 'Tall shoes' },
        { word: 'Sneakers', impostorHint: 'Footwear', hint: 'Sport shoes' },

        // Jewelry
        { word: 'Ring', impostorHint: 'Jewelry', hint: 'Finger jewelry' },
        { word: 'Necklace', impostorHint: 'Jewelry', hint: 'Neck jewelry' },
        { word: 'Earring', impostorHint: 'Jewelry', hint: 'Ear jewelry' },
        { word: 'Bracelet', impostorHint: 'Jewelry', hint: 'Wrist jewelry' },

        // Bags
        { word: 'Purse', impostorHint: 'Bags', hint: 'Hand bag' },
        { word: 'Wallet', impostorHint: 'Bags', hint: 'Money holder' },

        // Beauty
        { word: 'Makeup', impostorHint: 'Beauty', hint: 'Face paint' },
        { word: 'Perfume', impostorHint: 'Beauty', hint: 'Nice smell' },
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
        // Groups
        { word: 'BTS', impostorHint: 'Groups', hint: 'Bangtan Boys' },
        { word: 'BLACKPINK', impostorHint: 'Groups', hint: 'Pink Venom' },
        { word: 'TWICE', impostorHint: 'Groups', hint: 'One in a Million' },
        { word: 'EXO', impostorHint: 'Groups', hint: 'We Are One' },
        { word: 'SEVENTEEN', impostorHint: 'Groups', hint: '13 members' },
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
        { word: 'ATEEZ', impostorHint: 'Groups', hint: 'Pirate Kings' },
        { word: 'TREASURE', impostorHint: 'Groups', hint: 'YG Boy Group' },
        { word: 'THE BOYZ', impostorHint: 'Groups', hint: 'Road to Kingdom' },

        // Soloists
        { word: 'Jungkook', impostorHint: 'Soloists', hint: 'Golden Maknae' },
        { word: 'Jimin', impostorHint: 'Soloists', hint: 'BTS Vocalist' },
        { word: 'V', impostorHint: 'Soloists', hint: 'Kim Taehyung' },
        { word: 'Jennie', impostorHint: 'Soloists', hint: 'BLACKPINK Solo' },
        { word: 'Rosé', impostorHint: 'Soloists', hint: 'On The Ground' },
        { word: 'Lisa', impostorHint: 'Soloists', hint: 'Money rapper' },
        { word: 'IU', impostorHint: 'Soloists', hint: 'Nation\'s Little Sister' },
        { word: 'PSY', impostorHint: 'Soloists', hint: 'Gangnam Style' },
        { word: 'G-Dragon', impostorHint: 'Soloists', hint: 'BIGBANG Leader' },
        { word: 'Taeyang', impostorHint: 'Soloists', hint: 'Eyes Nose Lips' },
        { word: 'CL', impostorHint: 'Soloists', hint: '2NE1 Leader' },
        { word: 'Sunmi', impostorHint: 'Soloists', hint: 'Gashina' },
        { word: 'Taeyeon', impostorHint: 'Soloists', hint: 'SNSD Leader' },
        { word: 'Hwasa', impostorHint: 'Soloists', hint: 'MAMAMOO Solo' },

        // Songs
        { word: 'Dynamite', impostorHint: 'Songs', hint: 'BTS English Hit' },
        { word: 'Butter', impostorHint: 'Songs', hint: 'Smooth like' },
        { word: 'How You Like That', impostorHint: 'Songs', hint: 'BLACKPINK Hit' },
        { word: 'DDU-DU DDU-DU', impostorHint: 'Songs', hint: 'Gun sound song' },
        { word: 'Kill This Love', impostorHint: 'Songs', hint: 'BLACKPINK Anthem' },
        { word: 'Fancy', impostorHint: 'Songs', hint: 'TWICE Colorful' },
        { word: 'Cheer Up', impostorHint: 'Songs', hint: 'Shy shy shy' },
        { word: 'Love Scenario', impostorHint: 'Songs', hint: 'iKON Hit' },
        { word: 'Spring Day', impostorHint: 'Songs', hint: 'BTS Emotional' },
        { word: 'Fake Love', impostorHint: 'Songs', hint: 'BTS Dark' },

        // Terms
        { word: 'Comeback', impostorHint: 'Terms', hint: 'New release' },
        { word: 'Bias', impostorHint: 'Terms', hint: 'Favorite member' },
        { word: 'Maknae', impostorHint: 'Terms', hint: 'Youngest member' },
        { word: 'Aegyo', impostorHint: 'Terms', hint: 'Cute act' },
        { word: 'Daesang', impostorHint: 'Terms', hint: 'Grand Prize' },
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
        { word: 'Albert Einstein', impostorHint: 'Innovators', hint: 'Theory of Relativity scientist' },
        { word: 'Steve Jobs', impostorHint: 'Innovators', hint: 'Apple founder' },
        { word: 'Bill Gates', impostorHint: 'Innovators', hint: 'Microsoft founder' },
        { word: 'Elon Musk', impostorHint: 'Innovators', hint: 'Tesla & SpaceX CEO' },
        { word: 'Walt Disney', impostorHint: 'Innovators', hint: 'Mickey Mouse creator' },

        // Leaders
        { word: 'Barack Obama', impostorHint: 'Leaders', hint: '44th US President' },
        { word: 'Donald Trump', impostorHint: 'Leaders', hint: 'Billionaire President' },
        { word: 'Queen Elizabeth II', impostorHint: 'Leaders', hint: 'British Monarch' },
        { word: 'Princess Diana', impostorHint: 'Leaders', hint: 'People\'s Princess' },
        { word: 'Martin Luther King Jr', impostorHint: 'Leaders', hint: 'I Have a Dream' },
        { word: 'Nelson Mandela', impostorHint: 'Leaders', hint: 'Anti-apartheid leader' },
        { word: 'Mahatma Gandhi', impostorHint: 'Leaders', hint: 'Non-violent leader' },

        // Athletes
        { word: 'Cristiano Ronaldo', impostorHint: 'Athletes', hint: 'CR7 footballer' },
        { word: 'Lionel Messi', impostorHint: 'Athletes', hint: 'Argentine GOAT' },
        { word: 'LeBron James', impostorHint: 'Athletes', hint: 'King James basketball' },
        { word: 'Serena Williams', impostorHint: 'Athletes', hint: 'Tennis Queen' },
        { word: 'Muhammad Ali', impostorHint: 'Athletes', hint: 'Float like a butterfly' },
        { word: 'Mike Tyson', impostorHint: 'Athletes', hint: 'Iron Mike boxer' },
        { word: 'Usain Bolt', impostorHint: 'Athletes', hint: 'Fastest man alive' },
        { word: 'Virat Kohli', impostorHint: 'Athletes', hint: 'Indian cricketer' },
        { word: 'David Beckham', impostorHint: 'Athletes', hint: 'Free kick master' },

        // Musicians
        { word: 'Michael Jackson', impostorHint: 'Musicians', hint: 'King of Pop' },
        { word: 'Taylor Swift', impostorHint: 'Musicians', hint: 'Eras Tour singer' },
        { word: 'Beyoncé', impostorHint: 'Musicians', hint: 'Queen Bey' },
        { word: 'Kanye West', impostorHint: 'Musicians', hint: 'Yeezy rapper' },
        { word: 'Eminem', impostorHint: 'Musicians', hint: 'Slim Shady rapper' },
        { word: 'Rihanna', impostorHint: 'Musicians', hint: 'Umbrella singer' },
        { word: 'Justin Bieber', impostorHint: 'Musicians', hint: 'Baby singer' },
        { word: 'Harry Styles', impostorHint: 'Musicians', hint: 'One Direction alum' },
        { word: 'Drake', impostorHint: 'Musicians', hint: 'Canadian rapper' },
        { word: 'The Weeknd', impostorHint: 'Musicians', hint: 'Blinding Lights singer' },
        { word: 'Ariana Grande', impostorHint: 'Musicians', hint: 'High ponytail singer' },
        { word: 'Billie Eilish', impostorHint: 'Musicians', hint: 'Bad Guy singer' },
        { word: 'Elvis Presley', impostorHint: 'Musicians', hint: 'King of Rock and Roll' },
        { word: 'Freddie Mercury', impostorHint: 'Musicians', hint: 'Queen band singer' },
        { word: 'David Bowie', impostorHint: 'Musicians', hint: 'Ziggy Stardust' },
        { word: 'Prince', impostorHint: 'Musicians', hint: 'Purple Rain artist' },
        { word: 'Madonna', impostorHint: 'Musicians', hint: 'Queen of Pop' },
        { word: 'Britney Spears', impostorHint: 'Musicians', hint: 'Toxic singer' },
        { word: 'Shakira', impostorHint: 'Musicians', hint: 'Hips Don\'t Lie' },
        { word: 'Jennifer Lopez', impostorHint: 'Musicians', hint: 'J.Lo' },

        // Actors
        { word: 'Marilyn Monroe', impostorHint: 'Actors', hint: 'Blonde icon actress' },
        { word: 'Dwayne Johnson', impostorHint: 'Actors', hint: 'The Rock' },
        { word: 'Kevin Hart', impostorHint: 'Actors', hint: 'Short comedian' },
        { word: 'Will Smith', impostorHint: 'Actors', hint: 'Fresh Prince actor' },
        { word: 'Tom Cruise', impostorHint: 'Actors', hint: 'Mission Impossible star' },
        { word: 'Brad Pitt', impostorHint: 'Actors', hint: 'Fight Club star' },
        { word: 'Angelina Jolie', impostorHint: 'Actors', hint: 'Tomb Raider actress' },
        { word: 'Leonardo DiCaprio', impostorHint: 'Actors', hint: 'Titanic star' },
        { word: 'Johnny Depp', impostorHint: 'Actors', hint: 'Captain Jack Sparrow' },
        { word: 'Robert Downey Jr', impostorHint: 'Actors', hint: 'Iron Man actor' },
        { word: 'Chris Hemsworth', impostorHint: 'Actors', hint: 'Thor actor' },
        { word: 'Ryan Reynolds', impostorHint: 'Actors', hint: 'Deadpool actor' },
        { word: 'Zendaya', impostorHint: 'Actors', hint: 'MJ in Spider-Man' },
        { word: 'Tom Holland', impostorHint: 'Actors', hint: 'Spider-Man actor' },

        // Influencers
        { word: 'Kim Kardashian', impostorHint: 'Influencers', hint: 'Reality TV star' },
        { word: 'Kylie Jenner', impostorHint: 'Influencers', hint: 'Lip kit mogul' },
        { word: 'Oprah Winfrey', impostorHint: 'Influencers', hint: 'Talk show legend' },
        { word: 'Ellen DeGeneres', impostorHint: 'Influencers', hint: 'Talk show host' },
        { word: 'Gordon Ramsay', impostorHint: 'Influencers', hint: 'Angry chef' },
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

    if (keys.includes('all') || keys.length === 0) {
        // When 'all' is selected, only include FREE/unlocked categories
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
    } else {
        // When specific categories are selected, use them directly
        // (assumes the UI already filtered out premium categories)
        keys.forEach(key => {
            if (key !== 'all' && wordCategories[key]) {
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
    { key: 'ballKnowledge', label: 'Ball Knowledge', free: true, subcategories: [
        { key: 'football', label: 'Football' },
        { key: 'basketball', label: 'Basketball' },
    ]},
    { key: 'famousPeople', label: 'Famous People', premium: true },
];
