const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const generatePDF = (req, res) => {
  const { personal_data, education, recent_experience, projects, socials } = req.body;

  const sanitize = (input) => input
    ? input.replace(/([#%&{}~_^\\$])/g, '\\$1').replace(/([\"`])/g, '\\$1')
    : '';

  // LaTeX Template with dynamic data
  const latexTemplate = `
      %-------------------------
% Resume in Latex
% Author
% License : MIT
%------------------------

%---- Required Packages and Functions ----

\documentclass[a4paper,11pt]{article}

\setlength{\multicolsep}{0pt} 
\pagestyle{fancy}
\fancyhf{} % clear all header and footer fields
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}
\geometry{left=1.4cm, top=0.8cm, right=1.2cm, bottom=1cm}
% Adjust margins
%\addtolength{\oddsidemargin}{-0.5in}
%\addtolength{\evensidemargin}{-0.5in}
%\addtolength{\textwidth}{1in}
\tcbset{
	frame code={}
	center title,
	left=0pt,
	right=0pt,
	top=0pt,
	bottom=0pt,
	colback=gray!20,
	colframe=white,
	width=\dimexpr\textwidth\relax,
	enlarge left by=-2mm,
	boxsep=4pt,
	arc=0pt,outer arc=0pt,
}


\raggedright
\setlength{\tabcolsep}{0in}

% Sections formatting
\titleformat{\section}{
  \vspace{-4pt}\scshape\raggedright\large
}{}{0em}{}[\color{black}\titlerule \vspace{-7pt}]

%-------------------------
% Custom commands
\newcommand{\resumeItem}[2]{
  \item{
    \textbf{#1}{\hspace{0.5mm}#2 \vspace{-0.5mm}}
  }
}

\newcommand{\resumePOR}[3]{
\vspace{0.5mm}\item
    \begin{tabular*}{0.97\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1}\hspace{0.3mm}#2 & \textit{\small{#3}} 
    \end{tabular*}
    \vspace{-2mm}
}

\newcommand{\resumeSubheading}[4]{
\vspace{0.5mm}\item
    \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1} & \textit{\footnotesize{#4}} \\
        \textit{\footnotesize{#3}} &  \footnotesize{#2}\\
    \end{tabular*}
    \vspace{-2.4mm}
}

\newcommand{\resumeProject}[4]{
\vspace{0.5mm}\item
    \begin{tabular*}{0.98\textwidth}[t]{l@{\extracolsep{\fill}}r}
        \textbf{#1} & \textit{\footnotesize{#3}} \\
        \footnotesize{\textit{#2}} & \footnotesize{#4}
    \end{tabular*}
    \vspace{-2.4mm}
}

\newcommand{\resumeSubItem}[2]{\resumeItem{#1}{#2}\vspace{-4pt}}
% \renewcommand{\labelitemii}{$\circ$}
\renewcommand{\labelitemi}{$\vcenter{\hbox{\tiny$\bullet$}}$}
\newcommand{\resumeSubHeadingListStart}{\begin{itemize}[leftmargin=*,labelsep=0mm]}
\newcommand{\resumeHeadingSkillStart}{\begin{itemize}[leftmargin=*,itemsep=1.7mm, rightmargin=2ex]}
\newcommand{\resumeItemListStart}{\begin{justify}\begin{itemize}[leftmargin=3ex, rightmargin=2ex, noitemsep,labelsep=1.2mm,itemsep=0mm]\small}
\newcommand{\resumeSubHeadingListEnd}{\end{itemize}\vspace{2mm}}
\newcommand{\resumeHeadingSkillEnd}{\end{itemize}\vspace{-2mm}}
\newcommand{\resumeItemListEnd}{\end{itemize}\end{justify}\vspace{-2mm}}
\newcommand{\cvsection}[1]{%
\vspace{2mm}
\begin{tcolorbox}
    \textbf{\large #1}
\end{tcolorbox}
    \vspace{-4mm}
}
\newcolumntype{L}{>{\raggedright\arraybackslash}X}%
\newcolumntype{R}{>{\raggedleft\arraybackslash}X}%
\newcolumntype{C}{>{\centering\arraybackslash}X}%
%---- End of Packages and Functions ------

%-------------------------------------------
%%%%%%  CV STARTS HERE  %%%%%%%%%%%
%%%%%% DEFINE ELEMENTS HERE %%%%%%%
\newcommand{\name}{Soumen Bhunia} % Your Name
\newcommand{\course}{Computer Science and Engineering} % Your Program
\newcommand{\roll}{210301120102} % Your Roll No.
\newcommand{\phone}{9749807435} % Your Phone Number
\newcommand{\emaila}{me.soumen.bhunia@gmail.com} %Email 1

\begin{document}
\fontfamily{cmr}\selectfont
%----------HEADING-----------------

{
\begin{tabularx}{\linewidth}{L r} \\
  \textbf{\Large \name} & {\raisebox{0.0\height}{\footnotesize \faPhone}\ +91-\phone}\\
  {Roll No.: \roll } & \href{mailto:\emaila}{\raisebox{0.0\height}{\footnotesize \faEnvelope}\ {\emaila}} \\
  Bachelor of Technology & \href{https://github.com/soumen974}{\raisebox{0.0\height}{\footnotesize \faGithub}\ {GitHub Profile}} \\  
  {Centurion University of Technology and Management, Bhubaneswar} & \href{https://www.linkedin.com/in/soumen-bhunia-me-dvp/}{\raisebox{0.0\height}{\footnotesize \faLinkedin}\ {LinkedIn Profile}}
\end{tabularx}
}


%-----------EDUCATION-----------
\section{\textbf{Education}}
  \resumeSubHeadingListStart
    \resumeSubheading
      {Bachelor of Technology in Computer Science and Engineering(Software Technology)}{CGPA: 8.3}
      {Centurion University of Technology and Management, Bhubaneswar}{2021-25}
  \resumeSubHeadingListEnd
\vspace{-5.5mm}
%
%-----------PROJECTS-----------------
\section{\textbf{Personal Projects}}
\resumeSubHeadingListStart
    \resumeProject
      {Web Based Cube E-Commerce} %Project Name
      {A website based Ecommerce  site, implemented for both seller and buyer} %Project Name, Location Name
      {} %Event Dates

      \resumeItemListStart
        \item {Developed a responsive e-commerce platform designed for cube buyers and sellers, ensuring a seamless user experience across devices. }
        \item {Designed the UI using Figma, focusing on intuitive navigation, product display, and user engagement  }
        \item {Technology Used:  Reactjs, Tailwind CSS, Nodejs,express,MariaDB.}
       \item { Tools Used: Figma, Adobe Photoshop, Illustrator}
    \resumeItemListEnd
    \vspace{-2mm}
    
    \resumeProject
      {Developer Dashboard} %Project Name
      {A student developer dashboard for tracking and keeping all in one place } %Project Name, Location Name
      {} %Event Dates

      \resumeItemListStart
      \item {Created a student-centric dashboard for tracking developer tasks with features like to-do lists, reminders, and AI-based chat integration }
        \item {Designed the UI/UX using Figma, ensuring that the interface is visually appealing and user-friendly for students}
        \item {Technology Used: Reactjs, Tailwind CSS, Nodejs, Express, MongoDB,Google Gemini,Google Calender API.}
         \item { Tools Used: Figma, Adobe Photoshop, Illustrator}
    \resumeItemListEnd
    \vspace{-2mm}
      
  \resumeSubHeadingListEnd
\vspace{-8.5mm}


%-----------EXPERIENCE-----------------
\section{\textbf{Experience}}
  \resumeSubHeadingListStart
    \resumeSubheading
      {OctaNet Services Pvt Ltd. Internship}{Online}
      {Bhubaneswar }{May - July 2024}
      \vspace{-2.0mm}
      \resumeItemListStart
     \item { Worked on UI/UX design and development for various client projects using Figma, Adobe Photoshop, and Adobe Illustrator to create prototypes and wireframes.}
     \item { Designed mobile-responsive interfaces for multiple web applications, focusing on enhancing usability and accessibility.}
    \item {Proficient in designing, deploying, and managing fault-tolerant, highly available, and scalable web app}
    \resumeItemListEnd
    
    \vspace{-3.0mm}
    
    \resumeSubheading
      {Buildspace nw s5 Hackathon}{Online}
      {San Francisco Bay Area}{Jun 2024 - Jul 2024}
      \vspace{-2.0mm}
      \resumeItemListStart
    \item {A project centric task i have lead towords accomplition}
    \item {Product Designing, Teamleading,Team Managing}
    \item { Attending webiners ,Communications.}
    \resumeItemListEnd
    
    \vspace{-3.0mm}
      
  \resumeSubHeadingListEnd
\vspace{-5.5mm}







%-----------Technical skills-----------------
\section{\textbf{Technical Skills and Interests}}
 \begin{itemize}[leftmargin=0.05in, label={}]
    \small{\item{
     \textbf{Languages}{: C, Java, Javascript, TypeScript, HTML+CSS } \\
     \textbf{Libraries }{:  Node.js, Express.js, Nextjs, SpringBoot, Tailwind.CSS }\\ 
     \textbf{Web Dev Tools}{: Gira,Notion,Figma, VScode, Git, Github } \\ 
     \textbf{Frameworks}{: ReactJs } \\
     \textbf{Cloud/Databases}{:MongoDb, Relational Database(mySql) } \\  
       \textbf{UI/UX Skills}{: Wireframing, Prototyping, User Research, Responsive Design, Interaction Design}\\
     
     \textbf{Relevent Coursework}{: Data Structures \& Algorithms, Object Oriented Programming(JAVA), Database Management System, Software Engineering. } \\ 
     \textbf{Areas of Interest}{: UI/UX Designer and Developer, Full-stack Development.} \\
     \textbf{Soft Skills}{: Problem Solving, Self-learning, Presentation, Adaptability,Team leading} \\
    }}
 \end{itemize}
 \vspace{-16pt}



%-----------Positions of Responsibility-----------------
\section{\textbf{Positions of Responsibility}}
\vspace{-0.4mm}
\resumeSubHeadingListStart
\resumePOR{Product designer } % Position
    {Centurion University of Technology and management} %Club,Event
    {Oct -Dec 2023} %Tenure Period \\
    \resumeItemListStart
    \item {Designed the Placement Module for the university, focusing on creating a seamless user experience for students applying for placements.}
    \item {Worked as both the UI/UX designer and frontend developer, ensuring a cohesive design-to-development process}
    \resumeItemListEnd

\resumeSubHeadingListEnd
\vspace{-5mm}




% %-----------Achievements-----------------
\section{\textbf{Licenses and certifications}}
\vspace{-0.4mm}
\resumeSubHeadingListStart
    \resumePOR{Google} % Award
    {  Foundations of User Experience (UI/UX)  } % Event
    {} %Event Year
\resumePOR{HackerRank } % Award
    {4* in Java Competitive Coding } % Event
    {} %Event Year
    
\resumePOR{Infosys } % Award
    { An Overview of the Spring Framework Infosys} % Event
    {} %Event Year

    \resumePOR{IBM  } % Award
    {  Introduction to Web Development by IBM } % Event
    {} %Event Year

     \resumePOR{Meta} % Award
    {  Meta Reactjs Basics by Meta } % Event
    {} %Event Year
\resumeSubHeadingListEnd

\vspace{-5mm}



%-------------------------------------------
\end{document}

  `;

  // Define paths
  const texDir = path.join(__dirname, 'generated');
  const texFilePath = path.join(texDir, 'resume.tex');
  const pdfFilePath = path.join(texDir, 'resume.pdf');
  const logFilePath = path.join(texDir, 'resume.log');
  const auxFilePath = path.join(texDir, 'resume.aux');

  // Ensure the directory exists
  fs.mkdirSync(texDir, { recursive: true });

  // Write LaTeX template to .tex file
  fs.writeFile(texFilePath, latexTemplate, (err) => {
    if (err) {
      console.error(`Error writing LaTeX file: ${err.message}`);
      return res.status(500).send('Failed to write LaTeX file');
    }

    // Compile LaTeX to PDF
    exec(`pdflatex -interaction=nonstopmode -output-directory=${texDir} ${texFilePath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating PDF: ${error.message}`);
        console.error(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).send('Failed to generate PDF');
      }

      // Check if the PDF file exists
      fs.stat(pdfFilePath, (err, stats) => {
        if (err) {
          console.error(`Error checking PDF file: ${err.message}`);
          return res.status(500).send('PDF file not generated');
        }

        console.log(`PDF file generated: ${pdfFilePath} (${stats.size} bytes)`);

        // Upload PDF to Cloudinary
        cloudinary.uploader.upload(pdfFilePath, { resource_type: 'auto' }, (uploadErr, uploadResult) => {
          if (uploadErr) {
            console.error(`Error uploading to Cloudinary: ${uploadErr.message}`);
            return res.status(500).send('Failed to upload PDF to Cloudinary');
          }

          console.log(`PDF successfully uploaded to Cloudinary: ${uploadResult.secure_url}`);

          // Send the Cloudinary URL as the response
          res.json({ pdf_url: uploadResult.secure_url });

          // Clean up files (delete .tex, .pdf, .log, and .aux files)
          fs.unlink(texFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .tex file: ${unlinkErr.message}`);
          });
          fs.unlink(pdfFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .pdf file: ${unlinkErr.message}`);
          });
          fs.unlink(logFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .log file: ${unlinkErr.message}`);
          });
          fs.unlink(auxFilePath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting .aux file: ${unlinkErr.message}`);
          });
        });
      });
    });
  });
};

module.exports = {
  generatePDF
};
