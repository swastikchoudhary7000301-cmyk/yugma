require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const connectDB = require("./config/db");
const User = require("./models/user");
const Post = require("./models/Post");
const Connection = require("./models/Connection");
const Notification = require("./models/Notification");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

const DEMO_PASSWORD = "Demo@123";

const DEMO_EMAILS = Array.from(
  { length: 12 },
  (_, index) => `member${index + 1}@demo.yugma.app`
);

const people = [
  {
    name: "Aarav Sharma",
    email: DEMO_EMAILS[0],
    headline: "Full-stack Developer • React & Node.js",
    bio: "Building useful products with clean interfaces and reliable APIs.",
    location: "Bengaluru, India",
    skills: ["React", "Node.js", "MongoDB"],
    profilePicture: "https://i.pravatar.cc/240?img=12",
  },
  {
    name: "Ananya Verma",
    email: DEMO_EMAILS[1],
    headline: "Product Designer • UX Research",
    bio: "I turn complex workflows into simple, human-centered experiences.",
    location: "Delhi, India",
    skills: ["Figma", "UX", "Design Systems"],
    profilePicture: "https://i.pravatar.cc/240?img=47",
  },
  {
    name: "Rahul Mehta",
    email: DEMO_EMAILS[2],
    headline: "AI Engineer • LLM Applications",
    bio: "Experimenting with AI agents, retrieval systems and practical automation.",
    location: "Pune, India",
    skills: ["Python", "AI", "LLMs"],
    profilePicture: "https://i.pravatar.cc/240?img=33",
  },
  {
    name: "Priya Singh",
    email: DEMO_EMAILS[3],
    headline: "Growth Marketer • Startups",
    bio: "Helping early-stage teams turn good products into growing communities.",
    location: "Mumbai, India",
    skills: ["Marketing", "Growth", "Content"],
    profilePicture: "https://i.pravatar.cc/240?img=32",
  },
  {
    name: "Kabir Khan",
    email: DEMO_EMAILS[4],
    headline: "Software Engineer • Backend Systems",
    bio: "Backend engineering, databases and distributed systems enthusiast.",
    location: "Hyderabad, India",
    skills: ["Express", "PostgreSQL", "APIs"],
    profilePicture: "https://i.pravatar.cc/240?img=11",
  },
  {
    name: "Meera Patel",
    email: DEMO_EMAILS[5],
    headline: "Data Analyst • Business Intelligence",
    bio: "Making data easier to understand and decisions easier to defend.",
    location: "Ahmedabad, India",
    skills: ["SQL", "Power BI", "Analytics"],
    profilePicture: "https://i.pravatar.cc/240?img=44",
  },
  {
    name: "Rohan Jain",
    email: DEMO_EMAILS[6],
    headline: "Founder • EdTech Builder",
    bio: "Building products that help students learn, collaborate and get hired.",
    location: "Jaipur, India",
    skills: ["Startups", "EdTech", "Strategy"],
    profilePicture: "https://i.pravatar.cc/240?img=68",
  },
  {
    name: "Ishita Rao",
    email: DEMO_EMAILS[7],
    headline: "Frontend Engineer • TypeScript",
    bio: "Creating fast, accessible interfaces and design-system driven products.",
    location: "Chennai, India",
    skills: ["TypeScript", "React", "Accessibility"],
    profilePicture: "https://i.pravatar.cc/240?img=49",
  },
  {
    name: "Dev Malhotra",
    email: DEMO_EMAILS[8],
    headline: "Product Manager • B2B SaaS",
    bio: "Connecting customer problems, product strategy and measurable outcomes.",
    location: "Gurugram, India",
    skills: ["Product", "SaaS", "Strategy"],
    profilePicture: "https://i.pravatar.cc/240?img=59",
  },
  {
    name: "Nisha Kapoor",
    email: DEMO_EMAILS[9],
    headline: "Cybersecurity Analyst • Cloud Security",
    bio: "Learning, securing and simplifying cloud infrastructure for growing teams.",
    location: "Kochi, India",
    skills: ["Security", "AWS", "Risk"],
    profilePicture: "https://i.pravatar.cc/240?img=45",
  },
  {
    name: "Arjun Nair",
    email: DEMO_EMAILS[10],
    headline: "Mobile Developer • Flutter",
    bio: "Building mobile experiences that feel simple, fast and dependable.",
    location: "Kochi, India",
    skills: ["Flutter", "Dart", "Firebase"],
    profilePicture: "https://i.pravatar.cc/240?img=14",
  },
  {
    name: "Simran Kaur",
    email: DEMO_EMAILS[11],
    headline: "Content Strategist • Personal Branding",
    bio: "Helping professionals communicate expertise with clarity and consistency.",
    location: "Chandigarh, India",
    skills: ["Writing", "Branding", "Social Media"],
    profilePicture: "https://i.pravatar.cc/240?img=48",
  },
];

const imageUrls = [
  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1200&q=80",
];

const postTemplates = [
  { author: 0, content: "Just shipped a small improvement to our React dashboard today. The best product changes are often the ones that make a workflow feel effortless. 🚀", image: 0 },
  { author: 2, content: "What is one AI skill developers should learn this year? I think designing reliable AI workflows matters more than simply knowing how to call an API.", image: 1 },
  { author: 1, content: "A quick design lesson: if users need a tutorial to understand your primary action, the interface probably needs another pass.", image: 2 },
  { author: 4, content: "Backend tip: keep authentication, validation and business logic separated. Your future self will thank you when the project grows.", image: 3 },
  { author: 3, content: "Community beats broadcasting. Ask a thoughtful question, reply to people and build conversations instead of chasing impressions.", image: 4 },
  { author: 5, content: "A useful analytics habit: before opening a dashboard, write down the decision you are trying to make. Metrics become much more useful after that.", image: 5 },
  { author: 6, content: "We are exploring better ways for students and professionals to discover each other. The strongest opportunities usually start with one good conversation.", image: 6 },
  { author: 0, content: "Working on a professional networking project with real-time chat, profiles, connections and a social feed. Building in public is surprisingly motivating.", image: 7 },
  { author: 7, content: "TypeScript has become less about adding types and more about designing better boundaries between parts of a product. Small interfaces make large codebases easier to change.", image: 8 },
  { author: 8, content: "Product discovery reminder: do not ask users what features they want first. Start by understanding the problem, the context and the outcome they are trying to reach.", image: 9 },
  { author: 9, content: "Security is a product feature. Clear permissions, sensible defaults and useful audit logs can prevent problems before they become incidents.", image: 10 },
  { author: 10, content: "One mobile performance win today: reducing unnecessary rebuilds made a surprisingly big difference. Measure first, optimize second. 📱", image: 11 },
  { author: 11, content: "Personal branding does not have to mean posting every day. A clear point of view, useful examples and thoughtful conversations can go much further.", image: null },
  { author: 1, content: "Design systems are most valuable when they remove repeated decisions without removing creativity. Consistency should make teams faster, not slower.", image: 0 },
  { author: 2, content: "AI prototypes are easy. Reliable AI products are harder. Evaluation, fallbacks, observability and good user feedback loops are where the real engineering begins.", image: 1 },
  { author: 5, content: "A dashboard should answer a question, not display every number available in the database. Fewer, clearer metrics usually create better decisions.", image: 2 },
  { author: 3, content: "A great community manager is part researcher, part storyteller and part listener. The best conversations often reveal product ideas you would never get from a survey.", image: 3 },
  { author: 4, content: "If an API contract is unclear, frontend and backend teams pay the cost later. Write examples early and keep the contract boring and predictable.", image: 4 },
  { author: 6, content: "Students do not only need job boards. They need feedback, peers, mentors and places where their work can be discovered. 🌱", image: 5 },
  { author: 7, content: "Accessibility is not a final checklist. Keyboard navigation, readable contrast and useful labels belong in the first version of the interface.", image: 6 },
  { author: 8, content: "The strongest product teams I have worked with disagree often, but they disagree around evidence and user outcomes rather than opinions.", image: 7 },
  { author: 9, content: "Cloud security gets easier when ownership is clear. Every important resource should have someone responsible for access, monitoring and review.", image: 8 },
  { author: 10, content: "Cross-platform development is a tradeoff, not a shortcut. The goal is to share what should be shared while preserving the strengths of each platform.", image: 9 },
  { author: 11, content: "A useful writing exercise: explain your project to someone outside your field. If the value becomes clearer, you probably found a better way to communicate it.", image: 10 },
  { author: 0, content: "Weekend build log: cleaned up API errors, improved loading states and finally removed three pieces of duplicated UI. Small cleanup, big feeling of progress. ✨", image: 11 },
  { author: 2, content: "The best AI interface is often the one that tells users what the system knows, what it does not know and what they can do next.", image: null },
  { author: 4, content: "Database indexes are boring until the day your dataset grows. Then they become one of the most satisfying performance improvements you can make.", image: 4 },
  { author: 3, content: "Growth is not only acquisition. Activation, retention and meaningful product value matter more when you want a community that lasts.", image: 6 },
  { author: 5, content: "Good analytics asks both 'what happened?' and 'what should we do next?'. If the dashboard cannot help with the second question, it needs another layer of thinking.", image: 9 },
  { author: 6, content: "Building in public has one underrated benefit: you create a trail of decisions that makes your progress easier for others to understand and support.", image: null },
];

const commentTemplates = [
  "This is a really useful perspective. Thanks for sharing!",
  "Absolutely agree. We ran into something similar recently.",
  "Great point — especially the part about keeping the workflow simple.",
  "This is exactly the kind of practical advice people need more of.",
  "Interesting approach. I would love to hear how you measured the result.",
  "Saving this one for later. Very actionable.",
  "Well said! The small details really do make a difference.",
  "I have seen the same pattern on product teams. Great observation.",
  "This gave me a new way to think about the problem.",
  "Would love to see a follow-up post about this.",
];

async function main() {
  await connectDB();

  const ownerEmail = process.env.DEMO_OWNER_EMAIL?.trim().toLowerCase();
  let owner = ownerEmail
    ? await User.findOne({ email: ownerEmail })
    : await User.findOne().sort({ createdAt: 1 });

  if (!owner) {
    const password = await bcrypt.hash(DEMO_PASSWORD, 12);
    owner = await User.create({
      name: "Swastik Choudhary",
      email: "owner@demo.yugma.app",
      password,
      headline: "Full-stack Developer • Yugma Builder",
      bio: "Demo account for exploring the Yugma social networking experience.",
      location: "India",
      skills: ["React", "Node.js", "MongoDB"],
      profilePicture: "https://i.pravatar.cc/240?img=13",
    });
    console.log("Created demo owner: owner@demo.yugma.app");
  }

  console.log(`Demo data will be attached to: ${owner.name} (${owner.email})`);

  const password = await bcrypt.hash(DEMO_PASSWORD, 12);
  const demoUsers = [];

  for (const person of people) {
    const user = await User.findOneAndUpdate(
      { email: person.email },
      {
        $set: {
          ...person,
          password,
          isOnline: Math.random() > 0.35,
          lastSeen: new Date(),
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    demoUsers.push(user);
  }

  const demoIds = demoUsers.map((user) => user._id);

  await Post.deleteMany({ content: { $regex: "^\\[YUGMA DEMO\\]" } });
  await Notification.deleteMany({
    $or: [
      { recipient: owner._id, sender: { $in: demoIds } },
      { sender: owner._id, recipient: { $in: demoIds } },
    ],
  });
  await Connection.deleteMany({
    $or: [
      { requester: owner._id, recipient: { $in: demoIds } },
      { recipient: owner._id, requester: { $in: demoIds } },
    ],
  });

  const oldConversations = await Conversation.find({
    participants: { $in: [owner._id, ...demoIds] },
  }).select("_id");
  const oldConversationIds = oldConversations.map((item) => item._id);

  if (oldConversationIds.length) {
    await Message.deleteMany({ conversation: { $in: oldConversationIds } });
    await Conversation.deleteMany({ _id: { $in: oldConversationIds } });
  }

  const posts = [];
  for (let index = 0; index < postTemplates.length; index += 1) {
    const template = postTemplates[index];
    const author = template.author === 0 ? owner : demoUsers[template.author];
    const commentOne = demoUsers[(index + 1) % demoUsers.length];
    const commentTwo = demoUsers[(index + 3) % demoUsers.length];
    const commentThree = demoUsers[(index + 5) % demoUsers.length];
    const likeOne = demoUsers[(index + 2) % demoUsers.length];
    const likeTwo = demoUsers[(index + 4) % demoUsers.length];
    const likeThree = demoUsers[(index + 7) % demoUsers.length];

    const comments = [
      {
        user: commentOne._id,
        text: commentTemplates[index % commentTemplates.length],
        createdAt: new Date(Date.now() - (index + 1) * 35 * 60000),
      },
      {
        user: commentTwo._id,
        text: commentTemplates[(index + 3) % commentTemplates.length],
        createdAt: new Date(Date.now() - (index + 1) * 28 * 60000),
      },
    ];

    if (index % 3 !== 1) {
      comments.push({
        user: commentThree._id,
        text: commentTemplates[(index + 6) % commentTemplates.length],
        createdAt: new Date(Date.now() - (index + 1) * 19 * 60000),
      });
    }

    const post = await Post.create({
      author: author._id,
      content: `[YUGMA DEMO] ${template.content}`,
      image: template.image === null ? "" : imageUrls[template.image],
      likes: [likeOne._id, likeTwo._id, likeThree._id],
      comments,
      savedBy: index % 5 === 1 || index % 7 === 0 ? [owner._id] : [],
      createdAt: new Date(Date.now() - index * 75 * 60000),
    });

    posts.push(post);
  }

  const acceptedUsers = demoUsers.slice(0, 5);
  const pendingFromUsers = demoUsers.slice(5, 8);

  for (const person of acceptedUsers) {
    await Connection.create({
      requester: owner._id,
      recipient: person._id,
      status: "accepted",
    });
  }

  for (const person of pendingFromUsers) {
    await Connection.create({
      requester: person._id,
      recipient: owner._id,
      status: "pending",
    });
  }

  const acceptedCount = acceptedUsers.length;
  await User.findByIdAndUpdate(owner._id, {
    connectionsCount: acceptedCount,
    profileViews: 128,
    $addToSet: {
      savedPosts: { $each: posts.filter((_, index) => index === 1 || index === 6).map((post) => post._id) },
    },
  });

  for (const person of acceptedUsers) {
    await User.findByIdAndUpdate(person._id, {
      connectionsCount: Math.floor(Math.random() * 80) + 35,
      profileViews: Math.floor(Math.random() * 300) + 80,
    });
  }

  for (const person of pendingFromUsers) {
    await Notification.create({
      recipient: owner._id,
      sender: person._id,
      type: "connection",
      message: "sent you a connection request",
      read: false,
    });
  }

  await Notification.create({
    recipient: owner._id,
    sender: demoUsers[0]._id,
    type: "like",
    message: "liked your post",
    relatedId: posts[7]._id,
    read: false,
  });

  await Notification.create({
    recipient: owner._id,
    sender: demoUsers[1]._id,
    type: "comment",
    message: "commented on your post",
    relatedId: posts[7]._id,
    read: false,
  });

  await Notification.create({
    recipient: owner._id,
    sender: demoUsers[2]._id,
    type: "message",
    message: "sent you a message",
    read: true,
  });

  const chatPeople = demoUsers.slice(0, 3);
  const chatTexts = [
    [
      "Hey! I saw your latest project on Yugma.",
      "Thanks! I am polishing the dashboard this week.",
      "It already looks great. Let me know if you want feedback.",
    ],
    [
      "Are you joining the product discussion later?",
      "Yes, I would love to hear the team's ideas.",
      "Perfect. I will share the notes afterwards.",
    ],
    [
      "I am experimenting with an AI agent workflow.",
      "Nice! What are you using for the backend?",
      "Node.js with a small API layer. Keeping it simple for now.",
    ],
  ];

  for (let i = 0; i < chatPeople.length; i += 1) {
    const person = chatPeople[i];
    const conversation = await Conversation.create({
      participants: [owner._id, person._id],
    });

    let lastMessage = null;

    for (let j = 0; j < chatTexts[i].length; j += 1) {
      const sender = j === 1 ? owner : person;
      const receiver = j === 1 ? person : owner;

      lastMessage = await Message.create({
        conversation: conversation._id,
        sender: sender._id,
        receiver: receiver._id,
        text: chatTexts[i][j],
        read: j !== 2,
        createdAt: new Date(Date.now() - (3 - j) * 22 * 60000),
      });
    }

    conversation.lastMessage = lastMessage._id;
    conversation.updatedAt = new Date();
    await conversation.save();
  }

  console.log("");
  console.log("✅ Yugma demo data created successfully.");
  console.log(`👤 Owner: ${owner.email}`);
  console.log(`🔐 Demo user password: ${DEMO_PASSWORD}`);
  console.log(`📝 Posts: ${posts.length}`);
  console.log(`🤝 Accepted connections: ${acceptedUsers.length}`);
  console.log(`📨 Pending requests: ${pendingFromUsers.length}`);
  console.log(`💬 Conversations: ${chatPeople.length}`);
  console.log("");

  await mongoose.disconnect();
}

main().catch(async (error) => {
  console.error("❌ Demo seed failed:", error);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
