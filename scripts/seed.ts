import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const songs = [
  {
    title: "Evidências",
    artists: ["Chitãozinho & Xororó"],
    genres: ["Sertanejo"],
    coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Quando eu digo que deixei de te amar\nÉ porque eu te amo\nQuando eu digo que não quero mais você\nÉ porque eu te quero",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes Simplificados",
        content: "C - Am - F - G7",
        isMain: true,
      },
    ],
  },
  {
    title: "Como Nossos Pais",
    artists: ["Elis Regina", "Belchior"],
    genres: ["MPB"],
    coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Não quero lhe falar, meu grande amor\nDas coisas que aprendi nos discos\nQuero lhe contar como eu vivi\nE tudo o que aconteceu comigo",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes Completos",
        content: "G - D - Em - C - Am - D7",
        isMain: true,
      },
    ],
  },
  {
    title: "Que País É Este",
    artists: ["Legião Urbana"],
    genres: ["Rock", "Rock Brasileiro"],
    coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Nas favelas, no Senado\nSujeira pra todo lado\nNinguém respeita a Constituição\nMas todos acreditam no futuro da nação",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes",
        content: "Em - C - D - G",
        isMain: true,
      },
    ],
  },
  {
    title: "Garota de Ipanema",
    artists: ["Tom Jobim", "Vinícius de Moraes"],
    genres: ["Bossa Nova", "MPB"],
    coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Olha que coisa mais linda\nMais cheia de graça\nÉ ela, menina\nQue vem e que passa",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes Básicos",
        content: "F - G7 - Gm7 - Gb7",
        isMain: true,
      },
    ],
  },
  {
    title: "Anunciação",
    artists: ["Alceu Valença"],
    genres: ["Forró", "MPB"],
    coverUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Na bruma leve das paixões que vêm de dentro\nTu vens chegando pra brincar no meu destino",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes",
        content: "D - A - G - Em",
        isMain: true,
      },
    ],
  },
  {
    title: "Eduardo e Mônica",
    artists: ["Legião Urbana"],
    genres: ["Rock"],
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Quem um dia irá dizer\nQue existe razão\nNas coisas feitas pelo coração\nE quem irá dizer\nQue não existe razão",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes",
        content: "A - D - E - Bm",
        isMain: true,
      },
    ],
  },
  {
    title: "Faroeste Caboclo",
    artists: ["Legião Urbana"],
    genres: ["Rock"],
    coverUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Não tinha medo o tal João de Santo Cristo\nEra o que todos diziam quando ele se perdeu",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes",
        content: "Dm - Am - C - G",
        isMain: true,
      },
    ],
  },
  {
    title: "Asa Branca",
    artists: ["Luiz Gonzaga", "Humberto Teixeira"],
    genres: ["Baião", "Forró"],
    coverUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=300&h=300&fit=crop",
    pages: [
      {
        id: 1,
        type: "lyrics",
        title: "Letra",
        content: "Quando olhei a terra ardendo\nQual fogueira de São João\nEu perguntei a Deus do céu, ai\nPor que tamanha judiação",
        isMain: true,
      },
      {
        id: 2,
        type: "chords",
        title: "Acordes",
        content: "G - D7 - C - G7",
        isMain: true,
      },
    ],
  },
]

const artists = [
  {
    name: "Legião Urbana",
    genre: "Rock",
    songCount: 124,
    avatarUrl: "https://images.unsplash.com/photo-1453738773917-9c3eff1db985?w=300&h=300&fit=crop",
    verified: true,
  },
  {
    name: "Elis Regina",
    genre: "MPB",
    songCount: 89,
    avatarUrl: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop",
    verified: true,
  },
  {
    name: "Tom Jobim",
    genre: "Bossa Nova",
    songCount: 203,
    avatarUrl: "https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&h=300&fit=crop",
    verified: true,
  },
  {
    name: "Luiz Gonzaga",
    genre: "Baião / Forró",
    songCount: 345,
    avatarUrl: "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&h=300&fit=crop",
    verified: true,
  },
  {
    name: "Chitãozinho & Xororó",
    genre: "Sertanejo",
    songCount: 412,
    avatarUrl: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=300&h=300&fit=crop",
    verified: true,
  },
  {
    name: "Alceu Valença",
    genre: "MPB / Forró",
    songCount: 178,
    avatarUrl: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=300&h=300&fit=crop",
    verified: false,
  },
]

async function main() {
  console.log("Limpando dados existentes...")
  await prisma.lastSeen.deleteMany()
  await prisma.repertoire.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.song.deleteMany()

  console.log("Criando artistas...")
  const createdArtists = await Promise.all(
    artists.map((artist) => prisma.artist.create({ data: artist }))
  )
  console.log(`${createdArtists.length} artistas criados`)

  console.log("Criando músicas...")
  const createdSongs = await Promise.all(
    songs.map((song) => prisma.song.create({ data: song }))
  )
  console.log(`${createdSongs.length} músicas criadas`)

  console.log("Criando repertórios...")
  const repertoires = [
    {
      title: "Clássicos do Rock Brasileiro",
      owner: "rocklover_br",
      songIds: [createdSongs[2].id, createdSongs[5].id, createdSongs[6].id],
      description: "As melhores pedras do rock nacional para tocar na guitarra",
      coverUrl: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=400&h=400&fit=crop",
      isPublic: true,
    },
    {
      title: "MPB para Violão",
      owner: "violao_mpb",
      songIds: [createdSongs[1].id, createdSongs[3].id, createdSongs[4].id],
      description: "Repertório completo de MPB com cifras para violão",
      coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop",
      isPublic: true,
    },
    {
      title: "Sertanejo Universitário",
      owner: "sertanejo_hits",
      songIds: [createdSongs[0].id],
      description: "Os maiores hits do sertanejo universitário dos últimos 10 anos",
      coverUrl: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=400&h=400&fit=crop",
      isPublic: true,
    },
    {
      title: "Bossa Nova Essencial",
      owner: "bossa_nova_fan",
      songIds: [createdSongs[3].id],
      description: "Seleção das melhores bossas para piano e violão",
      coverUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=400&fit=crop",
      isPublic: true,
    },
    {
      title: "Forró de Raiz",
      owner: "nordestino_roots",
      songIds: [createdSongs[4].id, createdSongs[7].id],
      description: "Luiz Gonzaga, Dominguinhos e os clássicos do forró tradicional",
      coverUrl: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=400&h=400&fit=crop",
      isPublic: false,
    },
    {
      title: "Músicas para Fogueira",
      owner: "guitarra_bt",
      songIds: [createdSongs[0].id, createdSongs[2].id, createdSongs[5].id],
      description: "Para tocar com os amigos ao redor da fogueira",
      coverUrl: "https://images.unsplash.com/photo-1549213783-8284d0336c4f?w=400&h=400&fit=crop",
      isPublic: true,
    },
  ]

  const createdRepertoires = await Promise.all(
    repertoires.map((rep) => prisma.repertoire.create({ data: rep }))
  )
  console.log(`${createdRepertoires.length} repertórios criados`)

  console.log("Criando itens vistos recentemente...")
  const lastSeenItems = [
    { itemId: createdSongs[2].id, type: "song" },
    { itemId: createdArtists[0].id, type: "artist" },
    { itemId: createdSongs[5].id, type: "song" },
    { itemId: createdRepertoires[0].id, type: "repertoire" },
    { itemId: createdArtists[1].id, type: "artist" },
  ]

  await Promise.all(
    lastSeenItems.map((item) => prisma.lastSeen.create({ data: item }))
  )
  console.log(`${lastSeenItems.length} itens recentes criados`)

  console.log("Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
