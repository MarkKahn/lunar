import { shallow } from 'enzyme';
import transformer from '../../../src/components/Interweave/factories/transformer';

describe('transformer()', () => {
  it('replaces a tag with a link', () => {
    const a = document.createElement('a');
    a.setAttribute('href', 'http://airbnb.com');

    // @ts-ignore Need to fix types upstream
    const wrapper = shallow(transformer(a, 'Airbnb'));

    expect(wrapper).toMatchSnapshot();
  });

  it('uses text content as children', () => {
    const a = document.createElement('a');
    a.setAttribute('href', 'http://airbnb.com');
    a.textContent = 'Children';

    // @ts-ignore Need to fix types upstream
    const wrapper = shallow(transformer(a, []));

    expect(wrapper.prop('children')).toBe('Children');
  });

  it('does nothing for unknown element', () => {
    expect(transformer(document.createElement('div'), [])).toBeUndefined();
  });
});
