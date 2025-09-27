import { compile } from 'handlebars';

export const renderTemplate = (str: string, params: Record<string, string>): string => {
    const template = compile(str);
    return template(params);
};

export default renderTemplate;
