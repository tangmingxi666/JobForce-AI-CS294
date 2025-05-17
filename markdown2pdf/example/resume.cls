\NeedsTeXFormat{LaTeX2e}
\ProvidesClass{resume}[2014/08/16 Resume class]

\LoadClass[12pt,a4paper]{article}
\usepackage{times}
\usepackage{enumitem}
\usepackage[top=0.63cm,bottom=0.63cm,right=1.1cm,left=1.1cm]{geometry}

\setlength{\parindent}{0em}
\setlist{nosep,left=0em,labelindent=5pt,labelwidth=1.25em}

\newcommand{\@name}[1]{Your Name}
\newcommand{\name}[1]{\renewcommand{\@name}{#1}}
\def \makename {\huge\textbf\@name}

\newcommand*\@contacts{}
\newcommand*\contact[1]{
    \ifx\features\empty {\def\features{\par#1}}
    \else {\g@addto@macro\@contacts{\par#1}} % append \contact to \@contacts
    \fi
}
\def \makecontact{\llap{\parbox{\textwidth}{\footnotesize\raggedleft\@contacts}}}

\def \makeheader {\makebox[\textwidth]{\hfill\makename\hfill\makecontact}}

\newenvironment{ResumeSection}[1]{
    \MakeUppercase{\bf #1}
    \smallskip\hrule\medskip
}{
    \bigskip
}

\define@key{subsection}{org}{\def\subsection@org{#1}}
\define@key{subsection}{location}{\def\subsection@location{#1}}
\define@key{subsection}{position}{\def\subsection@position{#1}}
\define@key{subsection}{duration}{\def\subsection@duration{#1}}
\newenvironment{ResumeSubsection}[1]{
    \setkeys{subsection}{org=,location=,position=,duration=}
    \setkeys{subsection}{#1}
    \smallskip
    \par\textbf\subsection@org\hfill\subsection@location
    \ifx\subsection@position\empty {}
    \else {\par{\em\subsection@position}\hfill{\em\subsection@duration}}
    \fi
}{
    \bigskip
}
