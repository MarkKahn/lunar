/* eslint-disable react/no-multi-comp */

import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import { unwrapHOCs, mockContextConsumer } from '@airbnb/lunar-test-utils';
import connectToApp, { ConnectToAppProps } from '../../src/composers/connectToApp';
import AppContext from '../../src/components/AppContext';
import { Context } from '../../src/types';

function unwrap(element: any): Enzyme.ShallowWrapper {
  return unwrapHOCs(shallow(element), 'WithAppWrapper');
}

describe('connectToApp()', () => {
  let modifyPageData = false;

  class HasData extends React.Component<ConnectToAppProps> {
    registerPageData() {
      return { foo: modifyPageData ? 'baz' : 'bar' };
    }

    render() {
      return null;
    }
  }

  class NoData extends React.Component<ConnectToAppProps> {
    registerPageData() {
      return {};
    }

    render() {
      return null;
    }
  }

  class NoPushMethod extends React.Component<ConnectToAppProps> {
    render() {
      return null;
    }
  }

  let context: Context;
  let unmockConsumer: () => void;
  let wrapper: Enzyme.ReactWrapper;
  let Hoc: any;

  beforeEach(() => {
    context = {
      name: 'Lunar',
      data: {},
      toasts: [],
      addPageData: jest.fn(),
      addInfoToast: jest.fn(),
      addFailureToast: jest.fn(),
      addSuccessToast: jest.fn(),
      addRefreshToast: jest.fn(),
      removePageData: jest.fn(),
      removeToast: jest.fn(),
    };

    unmockConsumer = mockContextConsumer(AppContext, context);

    Hoc = connectToApp('HasData')(HasData);
    wrapper = mount(<Hoc>Child</Hoc>);
  });

  afterEach(() => {
    unmockConsumer();
  });

  it('errors if name is missing', () => {
    expect(() => {
      function Foo() {}

      // @ts-ignore Testing missing name
      Hoc = connectToApp()(Foo);
    }).toThrowError(
      'Connecting to the application shell requires a unique scope or component name.',
    );
  });

  it('returns an HOC', () => {
    expect(Hoc.displayName).toBe('withBoundary(connectToApp(HasData))');
    expect(Hoc.WrappedComponent).toBe(HasData);
  });

  describe('event data', () => {
    it('sets data on mount', () => {
      expect(context.addPageData).toHaveBeenCalledWith({
        app_name: 'Lunar',
        scope: 'HasData',
        foo: 'bar',
      });
    });

    it('sets data when component doesnt define data', () => {
      Hoc = connectToApp('NoData')(NoData);
      wrapper = mount(<Hoc>Child</Hoc>);

      expect(context.addPageData).toHaveBeenCalledWith({
        app_name: 'Lunar',
        scope: 'NoData',
      });
    });

    it('removes data on unmount', () => {
      const instance: any = wrapper.find('ConnectToApp').instance();

      instance.id = '123456';
      instance.componentWillUnmount();

      expect(context.removePageData).toHaveBeenCalledWith('123456');
    });

    it('only sets data on update if data changes', () => {
      expect(context.addPageData).toHaveBeenCalledTimes(1);

      wrapper.setProps({
        foo: 123,
      });

      expect(context.addPageData).toHaveBeenCalledTimes(1);

      wrapper.setProps({
        foo: 456,
      });

      expect(context.addPageData).toHaveBeenCalledTimes(1);

      modifyPageData = true;

      wrapper.setProps({
        foo: 789,
      });

      expect(context.addPageData).toHaveBeenCalledTimes(2);
    });
  });

  it('errors if registerPageData() method is not defined', () => {
    expect(() => {
      Hoc = connectToApp('NoPushMethod')(NoPushMethod);
      unwrap(<Hoc>Child</Hoc>);
    }).toThrowError('Connected component has not defined an registerPageData() method.');
  });
});
