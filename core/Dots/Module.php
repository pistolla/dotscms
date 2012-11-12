<?php
/**
 * This file is part of DotsCMS
 *
 * (c) 2012 DotsCMS <team@dotscms.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
namespace Dots;

use Zend\ModuleManager\Feature\AutoloaderProviderInterface;
use Zend\Mvc\MvcEvent;
use Dots\Registry;

class Module implements AutoloaderProviderInterface
{

    public function onBootstrap(MvcEvent $event)
    {
        $app = $event->getApplication();
        $serviceManager = $app->getServiceManager();
        Registry::set('service_locator', $serviceManager);

        // register json strategy to return json encoded strings where needed
        $jsonStrategy = $serviceManager->get('Zend\View\Strategy\JsonStrategy');
        $view = $serviceManager->get('Zend\View\View');
        $view->getEventManager()->attach($jsonStrategy, 200);
    }

    public function getAutoloaderConfig() {
        return array(
            'Zend\Loader\StandardAutoloader' => array(
                'namespaces' => array(
                    __NAMESPACE__ => __DIR__ . '/src/' . __NAMESPACE__,
                ),
            ),
        );
    }

    public function getConfig()
    {
        return include __DIR__ . '/config/module.config.php';
    }

}
