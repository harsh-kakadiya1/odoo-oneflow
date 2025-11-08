const db = require('./config/database');
const { Project } = require('./models');

(async () => {
  await db.connectDB();
  
  const allProjects = await Project.findAll({ 
    attributes: ['id', 'name', 'company_id'] 
  });
  
  const company2Projects = await Project.findAll({ 
    where: { company_id: 2 }, 
    attributes: ['id', 'name', 'company_id'] 
  });
  
  console.log('All projects:');
  allProjects.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}, Company: ${p.company_id}`));
  
  console.log('\nProjects for company 2:');
  company2Projects.forEach(p => console.log(`ID: ${p.id}, Name: ${p.name}, Company: ${p.company_id}`));
  
  process.exit();
})();