/*
* (c) Copyright IBM Corporation 2021
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*/

import { File, render } from '@asyncapi/generator-react-sdk';

// Import custom components from file 
import { ImportModels, PackageDeclaration, ImportDeclaration, Imports, Class, ClassHeader, ClassConstructor, RecordFaliure, ProcessJMSException, EnvJson, Close } from '../components/Common';
import { javaPackageToPath } from '../utils/String.utils';


import { Connection } from '../components/Connection';
import { ConnectionHelper} from '../components/ConnectionHelper';
import { LoggingHelper} from '../components/LoggingHelper'
import { PomHelper} from '../components/PomHelper'
import { Demo } from '../components/demo/Demo'

import { Models } from '../components/Files/Models'
import { Producers } from '../components/Files/Producers'
import { Consumers } from '../components/Files/Consumers'
import { PubSubBase } from '../components/Files/PubSubBase';
import { ModelContract } from '../components/ModelContract';

/* 
 * Each template to be rendered must have as a root component a File component,
 * otherwise it will be skipped.
 * 
 * If you don't want to render anything, you can return `null` or `undefined` and then Generator will skip the given template.
 * 
 * Below you can see how reusable chunks (components) could be called.
 * Just write a new component (or import it) and place it inside the File or another component.
 * 
 * Notice that you can pass parameters to components. In fact, underneath, each component is a pure Javascript function.
 */
export default function({ asyncapi, params }) {
  if (!asyncapi.hasComponents()) {
    return null;
  }

  const channels = asyncapi.channels();
  
  // Make folder

  let toRender = {
      producers: Producers(asyncapi, channels, params),
      connectionHelper: ConnectionHelperRenderer(asyncapi, params),
      models: Models(asyncapi.components().messages(), params),
      consumers: Consumers(asyncapi, channels, params),
      loggingHelper: LoggingHelperRenderer(asyncapi, params),
      connectionRender: ConnectionRender(asyncapi, params),
      envJson: EnvJsonRenderer(asyncapi, params),
      pubSubBase: PubSubBase(params),
      pomXml: PomXmlRenderer(params),
      demo: Demo(asyncapi, params),
      ModelContract: ModelContractRenderer(params)
  }

  // schemas is an instance of the Map
  return Object.entries(toRender).map(([name, renderFunction]) => {
    return renderFunction
  }).flat();
}

function LoggingHelperRenderer(asyncapi, params){
  const filePath = javaPackageToPath(params.package) + "LoggingHelper.java";
  return (
      <File name={filePath}>
        <PackageDeclaration path={params.package} />
        <LoggingHelper></LoggingHelper>
      </File>
  )
}

function ModelContractRenderer(params){
  const filePath = javaPackageToPath(params.package) + "models/ModelContract.java";
  const pkg = params.package + '.models';
  return (
      <File name={filePath}>
        <PackageDeclaration path={pkg} />
        <ModelContract></ModelContract>
      </File>
  )
}

function ConnectionRender(asyncapi, params){
  const filePath = javaPackageToPath(params.package) + "Connection.java";
  return (
      <File name={filePath}>
        <PackageDeclaration path={params.package} />
        <Connection></Connection>
      </File>
  )
}

function ConnectionHelperRenderer(asyncapi, params){
  const filePath = javaPackageToPath(params.package) + "ConnectionHelper.java";
  return (
      <File name={filePath}>
        <PackageDeclaration path={params.package} />
        <ConnectionHelper params={params}></ConnectionHelper>
      </File>
  )
}

function EnvJsonRenderer(asyncapi, params){
  return (
      <File name='/env.json'>
        <EnvJson asyncapi={asyncapi} params={params}></EnvJson>
      </File>
  )
}

function SubsciberGenerators(asyncapi, channels, params){
  return Object.entries(channels).map(([channelName, channel]) => {
    const name = channelName
    const className = toJavaClassName(channelName) + 'Subscriber'

    // Resolve associated messages this subscriber should support
    // TODO not just import all
    const messages = asyncapi.components().messages();
    const packageName = javaPackageToPath(params.package);

    if(channel.subscribe){
      return (
      
        <File name={`${packageName}${className}.java`}>
          <PackageDeclaration path={params.package}></PackageDeclaration>
          <ConsumerImports asyncapi={asyncapi} params={params}></ConsumerImports>

          <ImportModels messages={messages} params={params}></ImportModels>
  
          <Class name={className}>
            <ConsumerDeclaration name={channelName} />
  
            <ClassConstructor name={className}>
              <ConsumerConstructor asyncapi={asyncapi} params={params} name={name}/>
            </ClassConstructor>
      
            <ReceiveMessage asyncapi={asyncapi} name={channelName} channel={channel}></ReceiveMessage>
            
            <RecordFaliure></RecordFaliure>
            <ProcessJMSException></ProcessJMSException>
            <Close></Close>
          </Class>
        </File>
  
      );
    }
  });
}

function ProducerGenerators(asyncapi, channels, params){
  return Object.entries(channels).map(([channelName, channel]) => {
    const name = channelName
    const className = toJavaClassName(channelName) + 'Producer'
  });
}

function PomXmlRenderer(params){
  return (
      <File name='/pom.xml'>
        <PomHelper params={params}></PomHelper>
      </File>
  )
}