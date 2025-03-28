import React, { useState } from 'react';
import { Link, NavLink, useParams } from 'react-router-dom';

const Faq: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const { facultyId } = useParams<{ facultyId?: string }>();

    const faqData = [
        {
            category: 'general',
            question: '¿Qué es ProfeScore?',
            answer: 'ProfeScore es una plataforma independiente donde los estudiantes de la UANL pueden compartir opiniones y experiencias sobre los profesores de sus facultades. Los usuarios pueden calificar aspectos como la metodología de enseñanza, claridad en las explicaciones y trato hacia los alumnos.',
        },
        {
            category: 'general',
            question: '¿Cuál es el propósito de esta página?',
            answer: 'Nuestro objetivo es ayudar a los estudiantes a tomar decisiones informadas al elegir profesores, especialmente cuando no hay opción de selección. Además, buscamos fomentar una retroalimentación constructiva que contribuya a mejorar el ambiente académico.',
        },
        {
            category: 'general',
            question: '¿Quién creó ProfeScore y por qué?',
            answer: 'ProfeScore fue desarrollado por un estudiante de la UANL que buscó centralizar información sobre profesores de manera accesible y específica para la comunidad universitaria. La plataforma se inspira en sitios como listademaestros.com y misprofesores.com, pero está adaptada exclusivamente para la UANL.',
        },
        {
            category: 'general',
            question: '¿Quién es el responsable de ProfeScore?',
            answer: 'ProfeScore es un proyecto independiente creado por un estudiante. Aunque se basa en ideas de plataformas existentes, no está afiliado a la UANL ni a otras instituciones. El código fuente fue adaptado de joacoo.dev para cumplir con este propósito específico.',
        },
        {
            category: 'general',
            question: '¿Esta plataforma está en contra de los profesores?',
            answer: '¡Para nada! ProfeScore promueve la transparencia y el diálogo constructivo. Creemos que tanto alumnos como profesores pueden beneficiarse de una comunicación clara y respetuosa. Los comentarios deben enfocarse en experiencias académicas, no en ataques personales.',
        },
        {
            category: 'general',
            question: '¿Por qué hay comentarios groseros u ofensivos?',
            answer: 'Nos esforzamos por mantener un ambiente respetuoso. Todos los comentarios pasan por un filtro automático para detectar lenguaje inapropiado, y los usuarios pueden reportar contenido que infrinja nuestras normas. Sin embargo, debido al volumen de interacciones, es posible que algún comentario inadecuado no sea detectado de inmediato. Agradecemos tu colaboración reportándolo.',
        },
        {
            category: 'professors',
            question: 'Soy profesor/a y un comentario sobre mí es falso o difamatorio. ¿Qué puedo hacer?',
            answer: 'Puedes reportar el comentario haciendo clic en el botón "Reportar" en la publicación. También puedes solicitar la eliminación definitiva enviando un correo a contacto.profescore@gmail.com con una copia de tu identificación oficial, un documento que acredite tu vinculación con la UANL y una explicación detallada de la inconsistencia. Nos comprometemos a revisar tu solicitud en un plazo máximo de 24 horas hábiles.',
        },
        {
            category: 'general',
            question: '¿Tienen planes de agregar nuevas funciones?',
            answer: '¡Sí! Si tienes ideas para mejorar ProfeScore, escríbenos a contacto.profescore@gmail.com. Valoramos la retroalimentación de la comunidad para hacer la plataforma más útil y segura.',
        },
        {
            category: 'general',
            question: '¿Esta página viola alguna normativa de la UANL?',
            answer: 'ProfeScore opera bajo leyes mexicanas de libertad de expresión y protección de datos personales. No almacenamos información confidencial de usuarios ni profesores, y respetamos los derechos de privacidad. Los comentarios publicados son responsabilidad exclusiva de sus autores, no de ProfeScore. Si identificas un contenido que infrinja alguna ley, repórtalo inmediatamente.',
        },
    ];

    const filteredFaqData = faqData.filter(faq =>
        (activeCategory === 'all' || faq.category === activeCategory) &&
        (faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleAccordion = (index: number) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="bg-white min-h-screen flex flex-col">
            <header className="bg-white border-b border-gray-200">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <Link
                        to={facultyId ? `/` : "/"}
                        className="text-xl font-bold text-black"
                    >
                        ProfeScore
                    </Link>

                    {/* Menú móvil */}
                    <div className="md:hidden hover:text-gray-700">
                        <i className="fa-solid fa-bars md:hidden " onClick={() => setShowMobileMenu(!showMobileMenu)} ></i>
                    </div>

                    <nav className="hidden md:flex items-center space-x-6">
                        <NavLink
                            to="/faq"
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >Preguntas Frecuentes</NavLink>
                        <NavLink
                            to="/privacity"
                            className={({ isActive }) =>
                                `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                            }
                        >Preguntas Frecuentes</NavLink>
                    </nav>
                </div>

                {/* Menú móvil */}
                {showMobileMenu && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-2">
                        <nav className="container mx-auto px-4 flex flex-col space-y-3">


                            <NavLink
                                to="/faq"
                                className={({ isActive }) =>
                                    `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                                }
                            >Preguntas Frecuentes</NavLink>
                            <NavLink
                                to="/privacity"
                                className={({ isActive }) =>
                                    `text-sm ${isActive ? 'text-indigo-600 font-medium' : 'text-gray-600'}`
                                }
                            >Preguntas Frecuentes</NavLink>
                        </nav>
                    </div>
                )}
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Preguntas Frecuentes</h1>
                        <p className="text-lg text-gray-600">Encuentra respuestas a las preguntas más comunes sobre RATE</p>
                    </div>
                    <div className="mb-8">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <i className="fas fa-search text-gray-400"></i>
                            </div>
                            <input
                                type="text"
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Buscar preguntas..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mb-8">
                        <div className="flex flex-wrap gap-2">
                            <button
                                className={`category-btn ${activeCategory === 'all' ? 'active' : ''} px-4 py-2 rounded-full ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'} text-sm font-medium`}
                                onClick={() => setActiveCategory('all')}
                            >
                                Todas
                            </button>
                            <button
                                className={`category-btn px-4 py-2 rounded-full ${activeCategory === 'general' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'} text-sm font-medium`}
                                onClick={() => setActiveCategory('general')}
                            >
                                General
                            </button>
                            <button
                                className={`category-btn px-4 py-2 rounded-full ${activeCategory === 'professors' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-indigo-100'} text-sm font-medium`}
                                onClick={() => setActiveCategory('professors')}
                            >
                                Profesores
                            </button>
                        </div>
                    </div>
                    <div className="space-y-6" id="faq-container">
                        {filteredFaqData.length > 0 ? (
                            filteredFaqData.map((faq, index) => (
                                <div key={index} className="faq-item border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        className="faq-question w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 focus:outline-none"
                                        onClick={() => toggleAccordion(index)}
                                    >
                                        <span className="text-left font-medium text-gray-900">{faq.question}</span>
                                        <i className={`fas fa-chevron-down text-indigo-600 transition-transform ${activeIndex === index ? 'rotate-180' : ''}`}></i>
                                    </button>
                                    <div className={`faq-answer px-6 py-4 bg-gray-50 ${activeIndex === index ? 'block' : 'hidden'}`}>
                                        <p className="text-gray-700">{faq.answer}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div id="no-results" className="text-center py-8">
                                <i className="fas fa-search text-indigo-400 text-4xl mb-4"></i>
                                <p className="text-gray-600 text-lg">No se encontraron preguntas que coincidan con tu búsqueda.</p>
                                <p className="text-gray-500 mt-2">Intenta con otros términos o <a href="#" className="text-indigo-600 hover:underline" onClick={() => setSearchTerm('')}>ver todas las preguntas</a>.</p>
                            </div>
                        )}
                    </div>
                    <div className="mt-12 bg-indigo-50 rounded-lg p-6 border border-indigo-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-4">¿No encontraste lo que buscabas?</h2>
                        <p className="text-gray-700 mb-4">Si tienes alguna pregunta que no está respondida aquí, no dudes en contactarnos.</p>
                        <a href="mailto:contacto.profescore@gmail.com" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                            <i className="fas fa-envelope mr-2"></i> Contactar Soporte
                        </a>
                    </div>
                </div>
            </main>
            <footer className="bg-white py-8 border-t border-gray-200 flex justify-center">
                <div className="px-4 text-center text-gray-600 flex flex-col gap-4 md:flex-row">
                    <p>&copy; ProfeScore - {new Date().getFullYear()}</p>
                    <Link to="/faq" className="link">Preguntas Frecuentes</Link>
                    <Link to="/privacity" className="link">Términos de Privacidad</Link>
                </div>
            </footer>
        </div>
    );
};

export default Faq;