// Seed script para popular o banco de dados MongoDB via Prisma
// Execute via: npx tsx scripts/seed-mongodb.js

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const songs = [
  {
    title: "Evidências",
    artists: ["Chitãozinho e Xororó"],
    genres: ["Sertanejo"],
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273e6e4f1c3e4f3f9e5e3e4f1c3",
    pages: [
      {
        id: 1,
        type: "chords",
        title: "Cifra Principal",
        isMain: true,
        content: `[Intro] G  D  Em  C  D

[Verse]
G                    D
Quando eu digo que deixei de te amar
Em                   C
É porque eu te amo
G                    D
Quando eu digo que não quero mais você
Em                   C
É porque eu te quero

[Chorus]
G              D
Eu nego tanto
Em             C
Mas eu te amo`
      }
    ],
  },
  {
    title: "Anunciação",
    artists: ["Alceu Valença"],
    genres: ["MPB"],
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273f6e4f2c4e5f4f9e6e4e5f2c4",
    pages: [
      {
        id: 1,
        type: "chords",
        title: "Cifra Principal",
        isMain: true,
        content: `[Intro] Am  G  F  E

[Verse]
Am              G
Tu vens, tu vens
F               E
Eu já escuto os teus sinais
Am              G
Tu vens, tu vens
F               E
Eu já escuto os teus sinais

[Chorus]
F        G       Am
A lua me traiu
F        G       Am
A lua me traiu`
      }
    ],
  },
  {
    title: "Tempo Perdido",
    artists: ["Legião Urbana"],
    genres: ["Rock"],
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273a7e5f3c5e6f5f9e7e5e6f3c5",
    pages: [
      {
        id: 1,
        type: "chords",
        title: "Cifra Principal",
        isMain: true,
        content: `[Intro] G  D  Em  C

[Verse]
G                 D
Todos os dias quando acordo
Em                    C
Não tenho mais o tempo que passou
G                 D
Mas tenho muito tempo
Em                    C
Temos todo o tempo do mundo

[Chorus]
G       D        Em      C
Temos nosso próprio tempo`
      }
    ],
  },
  {
    title: "Amor de Violeiro",
    artists: ["Sérgio Reis"],
    genres: ["Sertanejo Raiz"],
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273b8e6f4c6e7f6f9e8e6e7f4c6",
    pages: [
      {
        id: 1,
        type: "chords",
        title: "Cifra Principal",
        isMain: true,
        content: `[Intro] D  A  Bm  G

[Verse]
D                    A
Sou caipira, pirapora
Bm                   G
Nossa Senhora de Aparecida
D                    A
Ilumina a mina escura
Bm                   G
E funda o trem da minha vida`
      }
    ],
  },
  {
    title: "Romaria",
    artists: ["Renato Teixeira", "Almir Sater"],
    genres: ["Sertanejo Raiz", "MPB"],
    coverUrl: "https://i.scdn.co/image/ab67616d0000b273c9e7f5c7e8f7f9e9e7e8f5c7",
    pages: [
      {
        id: 1,
        type: "chords",
        title: "Cifra Principal",
        isMain: true,
        content: `[Intro] Em  Am  D  G

[Verse]
Em                   Am
É de sonho e de pó
D                    G
O destino de um só
Em                   Am
Feito eu perdido em pensamentos
D                    G
Sobre o meu cavalo`
      }
    ],
  },
]

const artists = [
  {
    name: "Chitãozinho e Xororó",
    genre: "Sertanejo",
    songCount: 1,
    avatarUrl: "https://i.scdn.co/image/ab67616d0000b273e6e4f1c3e4f3f9e5e3e4f1c3",
    verified: true,
  },
  {
    name: "Alceu Valença",
    genre: "MPB",
    songCount: 1,
    avatarUrl: "https://i.scdn.co/image/ab67616d0000b273f6e4f2c4e5f4f9e6e4e5f2c4",
    verified: true,
  },
  {
    name: "Legião Urbana",
    genre: "Rock",
    songCount: 1,
    avatarUrl: "https://i.scdn.co/image/ab67616d0000b273a7e5f3c5e6f5f9e7e5e6f3c5",
    verified: true,
  },
  {
    name: "Sérgio Reis",
    genre: "Sertanejo Raiz",
    songCount: 1,
    avatarUrl: "https://i.scdn.co/image/ab67616d0000b273b8e6f4c6e7f6f9e8e6e7f4c6",
    verified: true,
  },
  {
    name: "Renato Teixeira",
    genre: "MPB",
    songCount: 1,
    avatarUrl: "https://i.scdn.co/image/ab67616d0000b273c9e7f5c7e8f7f9e9e7e8f5c7",
    verified: true,
  },
]

async function seed() {
  try {
    console.log("Starting seed...")
    
    // Clear existing data
    await prisma.lastSeen.deleteMany({})
    await prisma.repertoire.deleteMany({})
    await prisma.song.deleteMany({})
    await prisma.artist.deleteMany({})
    console.log("Cleared existing data")
    
    // Insert artists
    const createdArtists = await Promise.all(
      artists.map(artist => prisma.artist.create({ data: artist }))
    )
    console.log(`Inserted ${createdArtists.length} artists`)
    
    // Insert songs
    const createdSongs = await Promise.all(
      songs.map(song => prisma.song.create({ data: song }))
    )
    console.log(`Inserted ${createdSongs.length} songs`)
    
    // Create a sample repertoire with first 3 songs
    const songIds = createdSongs.slice(0, 3).map(s => s.id)
    await prisma.repertoire.create({
      data: {
        title: "Meu Repertório de Clássicos",
        owner: "usuario",
        songIds,
        description: "Uma seleção dos melhores clássicos da música brasileira",
        coverUrl: "https://i.scdn.co/image/ab67616d0000b273e6e4f1c3e4f3f9e5e3e4f1c3",
        isPublic: true,
      }
    })
    console.log("Inserted 1 repertoire")
    
    console.log("Seed completed successfully!")
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

seed()
