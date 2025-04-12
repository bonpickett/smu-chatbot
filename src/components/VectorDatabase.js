class VectorDatabase {
    constructor() {
      this.vectors = [];
      this.documents = [];
      this.initialized = false;
    }
  
    // Initialize the database with SMU-specific data
    async initialize() {
      if (this.initialized) return;
      
      // Sample SMU data for the vector database
      const smuData = [
        // Leadership Programs
        {
          text: "The Student Leadership Initiative (SLI) at SMU offers a four-year developmental leadership experience. The program includes mentoring, workshops, and networking events with alumni. Applications open each fall for first-year students.",
          category: "leadership",
          tags: ["leadership program", "mentoring", "workshops"]
        },
        {
          text: "The Crain Leadership Summit is an annual leadership conference held each February. It brings together student leaders from across campus for skill-building, networking, and leadership development.",
          category: "leadership",
          tags: ["crain", "conference", "annual", "summit", "skill-building"]
        },
        {
          text: "The Caswell Leadership Program is a prestigious leadership opportunity at SMU that provides a scholarship and specialized leadership training. Applications typically open in the spring semester for rising juniors.",
          category: "leadership",
          tags: ["caswell", "scholarship", "leadership program"]
        },
        {
          text: "The Emerging Leaders program is designed for first-year students who want to develop their leadership skills early in their college career. The program runs during the spring semester and includes a retreat, workshops, and small group discussions.",
          category: "leadership",
          tags: ["emerging leaders", "first-year", "workshops", "retreat"]
        },
        {
          text: "The Hilltop Scholars Program offers a specialized leadership track. Students in this program live in Virginia-Snider Hall and participate in leadership-focused programming throughout the academic year.",
          category: "leadership",
          tags: ["hilltop scholars", "virginia-snider", "residence hall", "program"]
        },
        {
          text: "SMU's Hunt Leadership Scholars program selects approximately 25 students each year who demonstrate extraordinary leadership potential. It provides a full scholarship covering tuition and fees plus a study abroad stipend.",
          category: "leadership",
          tags: ["hunt scholars", "scholarship", "study abroad", "prestigious"]
        },
        
        // Student Organizations
        {
          text: "SMU's Program Council is the primary campus programming board that plans events like Homecoming, Family Weekend, and Peruna Palooza. They meet weekly and are always looking for new members to help plan campus-wide events.",
          category: "organizations",
          tags: ["program council", "events", "homecoming", "planning"]
        },
        {
          text: "SMU's Student Foundation organizes Mustang Corral, an orientation program for first-year and transfer students. They also coordinate the annual Celebration of Lights holiday event and raise money for student scholarships.",
          category: "organizations",
          tags: ["student foundation", "corral", "orientation", "celebration of lights"]
        },
        {
          text: "SMU Connect is the online platform where students can browse all registered student organizations, see upcoming events, and track their involvement. Students can filter organizations by category, size, and meeting times.",
          category: "organizations",
          tags: ["smu connect", "database", "involvement", "student orgs"]
        },
        {
          text: "The Office of Student Activities & Multicultural Student Affairs (SAMSA) supports student organizations with resources, training, and funding opportunities. They oversee the student organization registration process and offer advisement to student leaders.",
          category: "organizations",
          tags: ["samsa", "resources", "funding", "registration"]
        },
        {
          text: "The Association of Black Students (ABS) at SMU hosts cultural events, service projects, and social gatherings. Their signature events include Black Excellence Ball and Soul Food Sunday, which bring together students from across campus.",
          category: "organizations",
          tags: ["abs", "black students", "cultural", "diversity", "events"]
        },
        
        // Service and Volunteering
        {
          text: "Alternative Breaks at SMU offers service-learning trips during fall, winter, and spring breaks. Students travel domestically and internationally to engage in community service while learning about social issues.",
          category: "service",
          tags: ["alternative breaks", "volunteer", "service", "travel"]
        },
        {
          text: "Mustang Heroes is SMU's largest service organization, offering weekly volunteer opportunities with community partners throughout Dallas. They organize into different committees focusing on education, environment, hunger, and more.",
          category: "service",
          tags: ["mustang heroes", "volunteer", "weekly service", "community partners"]
        },
        {
          text: "The Big Event is SMU's largest single-day service event held each spring. Students, faculty, and staff volunteer throughout the Dallas community on various service projects to give back to the local area.",
          category: "service",
          tags: ["big event", "single-day", "spring", "service project"]
        },
        
        // Greek Life
        {
          text: "Greek recruitment at SMU occurs at different times depending on the council. IFC and Panhellenic formal recruitment happen at the beginning of the fall semester, while NPHC and MGC organizations have their own recruitment schedules throughout the year.",
          category: "greek life",
          tags: ["greek", "fraternity", "sorority", "recruitment"]
        },
        {
          text: "SMU's Panhellenic Council oversees 8 sororities: Alpha Chi Omega, Chi Omega, Delta Delta Delta, Delta Gamma, Gamma Phi Beta, Kappa Alpha Theta, Kappa Kappa Gamma, and Pi Beta Phi. Formal recruitment happens in August before fall classes begin.",
          category: "greek life",
          tags: ["panhellenic", "sorority", "recruitment", "formal recruitment"]
        },
        
        // Campus Events
        {
          text: "Family Weekend at SMU happens each fall and includes a variety of events including the Boulevard (tailgate) before a football game, academic showcases, and family-friendly activities across campus.",
          category: "events",
          tags: ["family weekend", "boulevard", "football", "fall event"]
        },
        {
          text: "Celebration of Lights is an annual SMU tradition held in December. The Main Quad is decorated with thousands of lights, and the event features holiday music from student groups, hot chocolate, and the lighting of the SMU Christmas tree.",
          category: "events",
          tags: ["celebration of lights", "holiday", "christmas", "tradition", "december"]
        },
        
        // Recreation and Wellness
        {
          text: "Dedman Rec Center offers numerous intramural sports and club sports opportunities. Students can participate in competitive leagues or just for fun across dozens of sports and activities throughout the year.",
          category: "recreation",
          tags: ["dedman", "recreation", "intramurals", "club sports"]
        },
        
        // Academic Resources
        {
          text: "The Altshuler Learning Enhancement Center (A-LEC) offers free tutoring in most subjects, academic skills workshops, and ADHD/learning disability support. Located in Loyd All-Sports Center, they provide both drop-in and appointment-based services.",
          category: "academic",
          tags: ["alec", "tutoring", "academic support", "learning disabilities", "adhd"]
        }
      ];
  
      // Simple embedding simulation (in a real app, you'd use a proper embedding model)
      this.documents = smuData;
      this.vectors = smuData.map(doc => ({
        vector: this.simpleEmbedding(doc.text),
        docId: this.documents.indexOf(doc)
      }));
      
      this.initialized = true;
      return true;
    }
  
    // Simple mock embedding function (in production, you'd use a real embedding model)
    simpleEmbedding(text) {
      // This is a mock embedding function that creates a pseudo-vector based on word presence
      const keywords = [
        // Leadership keywords
        "leadership", "crain", "caswell", "emerging", "workshop", "training", 
        "scholarship", "hunt", "hilltop", "mentoring", "development", "summit",
        
        // Organizations keywords
        "organization", "club", "program council", "student foundation", "corral",
        "smu connect", "samsa", "association", "debate", "mock trial", "senate",
        "government", "involvement", "student org", "multicultural", "diversity",
        
        // Greek Life keywords
        "greek", "fraternity", "sorority", "panhellenic", "ifc", "nphc", 
        "multicultural greek", "mgc", "recruitment", "intake", "divine nine",
        
        // Service keywords
        "volunteer", "service", "alternative breaks", "mustang heroes", "big event",
        "community engagement", "cel", "embrey", "human rights", "advocacy",
        
        // Events keywords
        "event", "family weekend", "boulevard", "tailgate", "celebration of lights",
        "homecoming", "parade", "pigskin", "founders day", "peruna palooza",
        
        // Recreation keywords
        "dedman", "recreation", "intramurals", "club sports", "outdoor adventures",
        "fitness", "climbing", "wellness", "sports", "workout", "yoga",
        
        // Academic keywords
        "academic", "alec", "tutoring", "writing center", "pre-health", "pre-law",
        "advising", "learning", "support", "lsat", 
        
        // Arts keywords
        "meadows", "art", "museum", "performance", "concert", "theater", "exhibition",
        "film", "dance", "music",
        
        // Campus locations
        "hughes-trigg", "dallas hall", "virginia-snider", "dedman center", 
        "loyd all-sports", "meadows museum",
        
        // General SMU terms
        "smu", "student", "campus", "opportunity", "community", "activity",
        "foundation", "office", "center", "mustang", "peruna"
      ];
      
      const lowercaseText = text.toLowerCase();
      return keywords.map(keyword => 
        lowercaseText.includes(keyword) ? 1 : 0
      );
    }
  
    // Compute cosine similarity between two vectors
    cosineSimilarity(vecA, vecB) {
      const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
      const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
      const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
      return dotProduct / (magnitudeA * magnitudeB) || 0;
    }
  
    // Search for the most relevant documents
    async search(query, topK = 3) {
      await this.initialize();
      
      const queryVector = this.simpleEmbedding(query);
      
      // Calculate similarities
      const results = this.vectors.map(item => ({
        docId: item.docId,
        similarity: this.cosineSimilarity(queryVector, item.vector)
      }));
      
      // Sort by similarity and take top K
      results.sort((a, b) => b.similarity - a.similarity);
      const topResults = results.slice(0, topK);
      
      // Get the actual documents
      return topResults
        .filter(result => result.similarity > 0.1) // Filter out low relevance results
        .map(result => this.documents[result.docId]);
    }
  }
  
  export default VectorDatabase;