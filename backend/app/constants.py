# Mapeamento entre ODS (Objetivos de Desenvolvimento Sustentável), GRI e IFC Performance Standards

IFC_PERFORMANCE_STANDARDS = {
    "PS1": "Avaliação e Gestão de Riscos e Impactos Socioambientais",
    "PS2": "Condições de Emprego e Trabalho",
    "PS3": "Eficiência de Recursos e Prevenção da Poluição",
    "PS4": "Saúde e Segurança da Comunidade",
    "PS5": "Aquisição de Terra e Reassentamento Involuntário",
    "PS6": "Conservação da Biodiversidade e Gestão Sustentável de Recursos Naturais",
    "PS7": "Povos Indígenas",
    "PS8": "Patrimônio Cultural"
}

ODS_GRI_IFC_MAPPING = {
    "ODS1": {  # Erradicação da Pobreza
        "name": "Erradicação da Pobreza",
        "gri_indicators": [
            "201-1", "201-2", "202-1", "202-2", "203-2", 
            "413-1", "413-2"
        ],
        "ifc_standards": ["PS1", "PS2", "PS5", "PS7"],
        "ifc_descriptions": [
            "Avaliação de impactos na pobreza",
            "Condições justas de trabalho e renda",
            "Compensação justa em caso de reassentamento",
            "Proteção de comunidades vulneráveis"
        ]
    },
    "ODS2": {  # Fome Zero
        "name": "Fome Zero e Agricultura Sustentável",
        "gri_indicators": [
            "201-1", "202-1", "203-1", "203-2", "411-1", 
            "413-1", "413-2", "414-1", "414-2"
        ],
        "ifc_standards": ["PS5", "PS6", "PS7"],
        "ifc_descriptions": [
            "Proteção de terras agricultáveis",
            "Gestão sustentável de recursos naturais",
            "Direitos de povos tradicionais à terra"
        ]
    },
    "ODS3": {  # Saúde e Bem-Estar
        "name": "Saúde e Bem-Estar",
        "gri_indicators": [
            "203-2", "305-1", "305-2", "305-3", "305-6", "305-7",
            "306-1", "306-2", "306-3", "306-4", "403-1", "403-2",
            "403-3", "403-4", "403-5", "403-6", "403-7", "403-8",
            "403-9", "403-10"
        ],
        "ifc_standards": ["PS2", "PS3", "PS4"],
        "ifc_descriptions": [
            "Saúde e segurança ocupacional",
            "Prevenção da poluição",
            "Saúde e segurança da comunidade"
        ]
    },
    "ODS4": {  # Educação de Qualidade
        "name": "Educação de Qualidade",
        "gri_indicators": [
            "404-1", "404-2", "404-3", "413-1"
        ],
        "ifc_standards": ["PS1", "PS2", "PS7"],
        "ifc_descriptions": [
            "Programas de capacitação",
            "Treinamento e desenvolvimento",
            "Educação para comunidades tradicionais"
        ]
    },
    "ODS5": {  # Igualdade de Gênero
        "name": "Igualdade de Gênero",
        "gri_indicators": [
            "201-1", "202-1", "401-1", "401-3", "404-1", "404-3",
            "405-1", "405-2", "406-1", "414-1", "414-2"
        ],
        "ifc_standards": ["PS1", "PS2", "PS4"],
        "ifc_descriptions": [
            "Avaliação de impactos de gênero",
            "Igualdade no ambiente de trabalho",
            "Proteção contra assédio e violência"
        ]
    },
    "ODS6": {  # Água Potável e Saneamento
        "name": "Água Potável e Saneamento",
        "gri_indicators": [
            "303-1", "303-2", "303-3", "303-4", "303-5", 
            "306-1", "306-2", "306-3", "306-5"
        ],
        "ifc_standards": ["PS3", "PS4", "PS6"],
        "ifc_descriptions": [
            "Gestão eficiente de recursos hídricos",
            "Acesso a água potável",
            "Proteção de recursos h��dricos"
        ]
    },
    "ODS7": {  # Energia Limpa
        "name": "Energia Limpa e Acessível",
        "gri_indicators": [
            "201-1", "302-1", "302-2", "302-3", "302-4", "302-5"
        ],
        "ifc_standards": ["PS3", "PS6"],
        "ifc_descriptions": [
            "Eficiência energética",
            "Uso sustentável de recursos naturais"
        ]
    },
    "ODS8": {  # Trabalho Decente
        "name": "Trabalho Decente e Crescimento Econômico",
        "gri_indicators": [
            "201-1", "202-1", "202-2", "203-2", "301-1", "301-2",
            "302-1", "302-3", "302-4", "401-1", "401-2", "401-3",
            "402-1", "403-1", "403-2", "403-3", "403-4", "404-1",
            "404-2", "404-3", "405-1", "405-2", "406-1", "407-1",
            "408-1", "409-1", "414-1", "414-2"
        ],
        "ifc_standards": ["PS1", "PS2", "PS4"],
        "ifc_descriptions": [
            "Gestão de impactos socioeconômicos",
            "Condições dignas de trabalho",
            "Segurança no ambiente de trabalho"
        ]
    },
    "ODS9": {  # Indústria e Inovação
        "name": "Indústria, Inovação e Infraestrutura",
        "gri_indicators": [
            "201-1", "203-1", "203-2", "204-1"
        ],
        "ifc_standards": ["PS1", "PS3", "PS4"],
        "ifc_descriptions": [
            "Avaliação de impactos de infraestrutura",
            "Tecnologias limpas e eficientes",
            "Infraestrutura segura"
        ]
    },
    "ODS10": {  # Redução das Desigualdades
        "name": "Redução das Desigualdades",
        "gri_indicators": [
            "201-1", "202-1", "203-2", "401-2", "404-2", "405-2",
            "413-1", "413-2"
        ],
        "ifc_standards": ["PS1", "PS2", "PS5", "PS7"],
        "ifc_descriptions": [
            "Avaliação de impactos sociais",
            "Igualdade de oportunidades",
            "Compensação justa",
            "Proteção de grupos vulneráveis"
        ]
    },
    "ODS11": {  # Cidades Sustentáveis
        "name": "Cidades e Comunidades Sustentáveis",
        "gri_indicators": [
            "203-1", "203-2", "413-1", "413-2"
        ],
        "ifc_standards": ["PS3", "PS4", "PS5", "PS8"],
        "ifc_descriptions": [
            "Gestão de poluição urbana",
            "Infraestrutura comunitária segura",
            "Planejamento de reassentamento",
            "Preservação do patrimônio cultural"
        ]
    },
    "ODS12": {  # Consumo Responsável
        "name": "Consumo e Produção Responsáveis",
        "gri_indicators": [
            "301-1", "301-2", "301-3", "302-1", "302-2", "302-3",
            "302-4", "302-5", "303-1", "303-2", "303-3", "305-1",
            "305-2", "305-3", "305-6", "305-7", "306-1", "306-2",
            "306-3", "306-4", "417-1"
        ],
        "ifc_standards": ["PS3", "PS6"],
        "ifc_descriptions": [
            "Eficiência no uso de recursos",
            "Gestão sustentável de recursos naturais"
        ]
    },
    "ODS13": {  # Ação Climática
        "name": "Ação Contra a Mudança Global do Clima",
        "gri_indicators": [
            "201-2", "302-1", "302-2", "302-3", "302-4", "305-1",
            "305-2", "305-3", "305-4", "305-5"
        ],
        "ifc_standards": ["PS1", "PS3", "PS6"],
        "ifc_descriptions": [
            "Avaliação de riscos climáticos",
            "Redução de emissões",
            "Adaptação às mudanças climáticas"
        ]
    },
    "ODS14": {  # Vida na Água
        "name": "Vida na Água",
        "gri_indicators": [
            "304-1", "304-2", "304-3", "304-4", "306-1", "306-3",
            "306-5"
        ],
        "ifc_standards": ["PS3", "PS6"],
        "ifc_descriptions": [
            "Prevenção da poluição marinha",
            "Proteção de ecossistemas aquáticos"
        ]
    },
    "ODS15": {  # Vida Terrestre
        "name": "Vida Terrestre",
        "gri_indicators": [
            "304-1", "304-2", "304-3", "304-4", "306-1", "306-3",
            "306-5"
        ],
        "ifc_standards": ["PS6", "PS7"],
        "ifc_descriptions": [
            "Proteção da biodiversidade",
            "Gestão sustentável de recursos naturais",
            "Direitos de comunidades tradicionais"
        ]
    }
}

# Funções auxiliares atualizadas para o novo formato
def get_complete_mapping(ods_code: str) -> dict:
    """
    Retorna o mapeamento completo para um ODS específico
    Exemplo: get_complete_mapping('ODS15')
    """
    return ODS_GRI_IFC_MAPPING.get(ods_code, {})

def get_gri_indicators_for_ods(ods_code: str) -> list:
    """
    Retorna indicadores GRI para um ODS
    """
    mapping = ODS_GRI_IFC_MAPPING.get(ods_code, {})
    return mapping.get("gri_indicators", [])

def get_ifc_standards_for_ods(ods_code: str) -> list:
    """
    Retorna padrões IFC para um ODS
    """
    mapping = ODS_GRI_IFC_MAPPING.get(ods_code, {})
    return mapping.get("ifc_standards", [])

def get_ifc_descriptions_for_ods(ods_code: str) -> list:
    """
    Retorna descrições dos padrões IFC para um ODS
    """
    mapping = ODS_GRI_IFC_MAPPING.get(ods_code, {})
    return mapping.get("ifc_descriptions", [])

# Tipos de documentos disponíveis
DOCUMENT_TYPES = [
    'Política',
    'Procedimento',
    'Manual',
    'Relatório',
    'Apresentação',
    'Planilha',
    'Contrato',
    'Outros'
] 