from app.agent.schemas.intake import TextParserOutput
from app.agent.utils.llm import GroqAgent
from app.agent.config.llms_config_loader import LLMConfig

from app.utils.logger import get_logger
logger = get_logger(__name__)

def stt(speech) -> str:
    # should execute proper stt script
    logger.info('Inside stt tool')
    return 'We have been stuck inside the house due to the flood outside'

def analyse_image(image_url) -> str:
    logger.info('Inside analyse_image tool')

    # Instantiate the agent and config
    groq_agent = GroqAgent()
    llm_cfg = LLMConfig()

    system_prompt = """
    You are a disaster image analyzer agent. 
    You will be provided with an image of a disaster.
    Analyse the image and generate a detailed description of the image.
    """
    user_prompt = "Analyse the image"

    # Make the request
    summary = groq_agent.complete(
        system_prompt=system_prompt,
        user_prompt=user_prompt,
        model=llm_cfg.get_model('groq', 'ANALYSE_IMAGE'),
        response_model=str,
        image_url=image_url,
        trace_name='analyse_image'
    )

    return summary

def parse_text(prompt) -> TextParserOutput:
    logger.info('Inside parse_text tool')

    # Instantiate the agent and config
    groq_agent = GroqAgent()
    llm_cfg = LLMConfig()

    system_prompt = """
    You are a request parsing agent, your task is to analyse the request related to the disaster and parse it into the required response format.
    """

    # Make the request
    parsed_request = groq_agent.complete(
        system_prompt=system_prompt,
        user_prompt=prompt,
        model=llm_cfg.get_model('groq', 'PARSE_TEXT'),
        response_model=TextParserOutput,
        trace_name='parse_text'
    )

    for key, value in parsed_request.dict().items():
        logger.debug(f"{key}: {value}")

    return parsed_request