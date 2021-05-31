const fastify = require('fastify')({
    logger: true
})

fastify.register(require('fastify-cors'), { 
    origin: "*",
    methods: ["*"]
})

fastify.post('/auth/token', async (request, reply) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { 
    heart: 'still exist', 
  }
})

fastify.post('/auth/refresh', async (request, reply) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { 
      heart: 'still exist', 
    }
  })

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()